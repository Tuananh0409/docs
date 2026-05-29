package com.example.pms.backend.service;

import com.example.pms.backend.dto.project.AddProjectMemberRequest;
import com.example.pms.backend.dto.project.CreateProjectRequest;
import com.example.pms.backend.dto.project.ProjectMemberResponse;
import com.example.pms.backend.dto.project.ProjectResponse;
import com.example.pms.backend.dto.project.ProjectSummaryResponse;
import com.example.pms.backend.dto.project.UpdateProjectMemberRoleRequest;
import com.example.pms.backend.dto.project.UpdateProjectRequest;
import com.example.pms.backend.entity.Project;
import com.example.pms.backend.entity.ProjectMember;
import com.example.pms.backend.entity.ProjectRole;
import com.example.pms.backend.entity.ProjectPriority;
import com.example.pms.backend.entity.ProjectStatus;
import com.example.pms.backend.entity.User;
import com.example.pms.backend.entity.Workspace;
import com.example.pms.backend.entity.WorkspaceMember;
import com.example.pms.backend.exception.BusinessException;
import com.example.pms.backend.exception.ErrorCode;
import com.example.pms.backend.repository.ProjectMemberRepository;
import com.example.pms.backend.repository.ProjectRepository;
import com.example.pms.backend.repository.UserRepository;
import com.example.pms.backend.repository.WorkspaceMemberRepository;
import com.example.pms.backend.security.CurrentUserProvider;
import com.example.pms.backend.util.SlugUtils;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private static final String ROLE_ADMIN = "Admin";
    private static final String ROLE_PM = "PM";
    private static final String ROLE_LEAD = "Lead";
    private static final String STATUS_ACTIVE = "Active";
    private static final String PRIVACY_PRIVATE = "PRIVATE";
    private static final String DEFAULT_PRIORITY = "Medium";

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final ProjectMemberService projectMemberService;
    private final ProjectTaskStatusService projectTaskStatusService;
    private final LookupCacheService lookupCacheService;
    private final CurrentUserProvider currentUserProvider;

    @Transactional(readOnly = true)
    public List<ProjectSummaryResponse> listByWorkspace(Long workspaceId) {
        User currentUser = currentUserProvider.getCurrentUser();
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, currentUser.getId())) {
            throw new BusinessException(ErrorCode.WORKSPACE_FORBIDDEN);
        }

        return projectRepository.findVisibleProjectsWithMyRole(workspaceId, currentUser.getId()).stream()
                .map(row -> {
                    Project project = (Project) row[0];
                    String myRole = (String) row[1];
                    return toSummary(project, workspaceId, myRole);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getById(Long workspaceId, Long projectId) {
        User currentUser = currentUserProvider.getCurrentUser();
        ProjectWithAccess loaded = loadProjectWithAccess(workspaceId, projectId, currentUser.getId());
        return toDetail(loaded.project(), loaded.access());
    }

    @Transactional
    public ProjectResponse create(Long workspaceId, CreateProjectRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        WorkspaceMember membership = requireWorkspaceMember(workspaceId, currentUser.getId());
        requireCanCreateProject(membership);

        Workspace workspace = membership.getWorkspace();

        String name = request.getName().trim();
        if (projectRepository.existsByWorkspaceIdAndNameIgnoreCaseAndDeletedFalse(workspaceId, name)) {
            throw new BusinessException(ErrorCode.PROJECT_NAME_EXISTS);
        }

        Instant start = toInstantStart(request.getStartDate());
        Instant end = toInstantEnd(request.getEndDate());
        validateDateRange(start, end);

        String code = resolveProjectCode(workspace.getCode(), name, request.getCode());
        String slug = resolveProjectSlug(workspace.getSlug(), name, request.getSlug());
        ProjectStatus status = resolveStatus(request.getStatusName());
        ProjectPriority priority = resolvePriority(request.getPriorityName());
        User projectLead = resolveProjectLead(workspaceId, request.getProjectLeadUserId(), currentUser);

        Project project = Project.builder()
                .workspace(workspace)
                .name(name)
                .description(trimToNull(request.getDescription()))
                .code(code)
                .slug(slug)
                .projectManager(projectLead)
                .status(status)
                .priority(priority)
                .privacyMode(normalizePrivacy(request.getPrivacyMode()))
                .colorCode(normalizeColor(request.getColorCode()))
                .startDate(start)
                .endDate(end)
                .deleted(false)
                .build();

        project = projectRepository.save(project);
        projectTaskStatusService.seedDefaultColumns(project);
        projectMemberService.addMembersOnProjectCreate(project, projectLead, currentUser);

        return toDetail(project, accessAfterCreate(membership, projectLead, currentUser));
    }

    @Transactional
    public ProjectResponse update(Long workspaceId, Long projectId, UpdateProjectRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        ProjectWithAccess loaded = loadProjectWithAccess(workspaceId, projectId, currentUser.getId());
        Project project = loaded.project();
        ProjectAccessInfo access = loaded.access();
        if (isPriorityOnlyUpdate(request)) {
            if (access.myRole() == null) {
                throw new BusinessException(ErrorCode.PROJECT_FORBIDDEN);
            }
        } else if (!access.canManage()) {
            throw new BusinessException(ErrorCode.PROJECT_FORBIDDEN);
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            String name = request.getName().trim();
            if (!name.equalsIgnoreCase(project.getName())
                    && projectRepository.existsByWorkspaceIdAndNameIgnoreCaseAndDeletedFalse(
                            workspaceId, name)) {
                throw new BusinessException(ErrorCode.PROJECT_NAME_EXISTS);
            }
            project.setName(name);
        }

        if (request.getDescription() != null) {
            project.setDescription(trimToNull(request.getDescription()));
        }

        Instant start = request.getStartDate() != null ? toInstantStart(request.getStartDate()) : project.getStartDate();
        Instant end = request.getEndDate() != null ? toInstantEnd(request.getEndDate()) : project.getEndDate();
        if (request.getStartDate() != null) {
            project.setStartDate(start);
        }
        if (request.getEndDate() != null) {
            project.setEndDate(end);
        }
        validateDateRange(project.getStartDate(), project.getEndDate());

        if (request.getColorCode() != null) {
            project.setColorCode(normalizeColor(request.getColorCode()));
        }
        if (request.getPrivacyMode() != null && !request.getPrivacyMode().isBlank()) {
            project.setPrivacyMode(normalizePrivacy(request.getPrivacyMode()));
        }
        if (request.getStatusName() != null && !request.getStatusName().isBlank()) {
            project.setStatus(resolveStatus(request.getStatusName()));
        }
        if (request.getPriorityName() != null && !request.getPriorityName().isBlank()) {
            project.setPriority(resolvePriority(request.getPriorityName()));
        }
        if (request.getProjectLeadUserId() != null) {
            User newLead = resolveProjectLead(workspaceId, request.getProjectLeadUserId(), currentUser);
            project.setProjectManager(newLead);
            ensureProjectLeadMembership(project, newLead);
        }

        project = projectRepository.save(project);
        return toDetail(project, access);
    }

    @Transactional
    public void delete(Long workspaceId, Long projectId) {
        User currentUser = currentUserProvider.getCurrentUser();
        if (!workspaceMemberRepository.isWorkspaceAdmin(workspaceId, currentUser.getId())) {
            throw new BusinessException(ErrorCode.PROJECT_FORBIDDEN);
        }
        if (projectRepository.softDeleteByIdAndWorkspaceId(projectId, workspaceId) == 0) {
            throw new BusinessException(ErrorCode.PROJECT_NOT_FOUND);
        }
    }

    @Transactional(readOnly = true)
    public List<ProjectMemberResponse> listMembers(Long workspaceId, Long projectId) {
        User currentUser = currentUserProvider.getCurrentUser();
        ProjectAccessInfo access = resolveProjectAccessInfo(workspaceId, projectId, currentUser.getId());
        if (access.myRole() == null) {
            throw new BusinessException(ErrorCode.PROJECT_FORBIDDEN);
        }

        return projectMemberRepository.findByProjectIdWithDetailsOrderByJoinedAtAsc(projectId).stream()
                .map(this::toMemberResponse)
                .toList();
    }

    @Transactional
    public ProjectMemberResponse addMember(
            Long workspaceId, Long projectId, AddProjectMemberRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        ProjectAccessInfo access = resolveProjectAccessInfo(workspaceId, projectId, currentUser.getId());
        if (!access.canManageMembers()) {
            throw new BusinessException(
                    ErrorCode.PROJECT_FORBIDDEN, "Chỉ PM dự án hoặc Admin workspace mới quản lý thành viên");
        }

        Project project = loadProjectRef(workspaceId, projectId);
        User user = userRepository
                .findById(request.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        ProjectMember member = projectMemberService.addMember(project, user, request.getRoleName());
        return toMemberResponse(member);
    }

    @Transactional
    public ProjectMemberResponse updateMemberRole(
            Long workspaceId,
            Long projectId,
            Long userId,
            UpdateProjectMemberRoleRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        ProjectAccessInfo access = resolveProjectAccessInfo(workspaceId, projectId, currentUser.getId());
        if (!access.canManageMembers()) {
            throw new BusinessException(
                    ErrorCode.PROJECT_FORBIDDEN, "Chỉ PM dự án hoặc Admin workspace mới quản lý thành viên");
        }

        ProjectMember member = projectMemberRepository
                .findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "Thành viên không thuộc dự án"));

        ProjectRole newRole = projectMemberService.requireProjectRole(request.getRoleName().trim());

        String oldRole = member.getRole().getRoleName();
        if (ROLE_PM.equalsIgnoreCase(oldRole) && !ROLE_PM.equalsIgnoreCase(newRole.getRoleName())) {
            if (projectMemberRepository.countPmByProjectId(projectId) <= 1) {
                throw new BusinessException(ErrorCode.PROJECT_LAST_PM);
            }
        }

        member.setRole(newRole);
        return toMemberResponse(projectMemberRepository.save(member));
    }

    @Transactional
    public void removeMember(Long workspaceId, Long projectId, Long userId) {
        User currentUser = currentUserProvider.getCurrentUser();
        ProjectAccessInfo access = resolveProjectAccessInfo(workspaceId, projectId, currentUser.getId());
        if (!access.canManageMembers()) {
            throw new BusinessException(
                    ErrorCode.PROJECT_FORBIDDEN, "Chỉ PM dự án hoặc Admin workspace mới quản lý thành viên");
        }

        ProjectMember member = projectMemberRepository
                .findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "Thành viên không thuộc dự án"));

        if (ROLE_PM.equalsIgnoreCase(member.getRole().getRoleName())
                && projectMemberRepository.countPmByProjectId(projectId) <= 1) {
            throw new BusinessException(ErrorCode.PROJECT_LAST_PM);
        }

        projectMemberRepository.delete(member);
    }

    private record ProjectAccessInfo(
            String myRole, boolean canManage, boolean canEditPriority, boolean canManageMembers) {}

    private record ProjectWithAccess(Project project, ProjectAccessInfo access) {}

    private ProjectWithAccess loadProjectWithAccess(Long workspaceId, Long projectId, Long userId) {
        Object[] row = projectRepository
                .findByIdWithAccess(projectId, workspaceId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
        ProjectAccessInfo access = accessFromEffectiveRole((String) row[1]);
        if (access.myRole() == null) {
            throw new BusinessException(ErrorCode.PROJECT_FORBIDDEN);
        }
        return new ProjectWithAccess((Project) row[0], access);
    }

    private Project loadProjectRef(Long workspaceId, Long projectId) {
        return projectRepository
                .findRefByIdAndWorkspaceId(projectId, workspaceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
    }

    private WorkspaceMember requireWorkspaceMember(Long workspaceId, Long userId) {
        return workspaceMemberRepository
                .findByWorkspaceIdAndUserIdWithDetails(workspaceId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WORKSPACE_FORBIDDEN));
    }

    private void requireCanCreateProject(WorkspaceMember membership) {
        String role = membership.getRole().getRoleName();
        if (ROLE_ADMIN.equalsIgnoreCase(role) || "Member".equalsIgnoreCase(role)) {
            return;
        }
        throw new BusinessException(ErrorCode.PROJECT_FORBIDDEN, "Bạn không có quyền tạo dự án");
    }

    private ProjectAccessInfo resolveProjectAccessInfo(Long workspaceId, Long projectId, Long userId) {
        return projectMemberRepository
                .findEffectiveProjectRoleName(workspaceId, projectId, userId)
                .map(ProjectService::accessFromEffectiveRole)
                .orElse(NO_PROJECT_ACCESS);
    }

    private static final ProjectAccessInfo NO_PROJECT_ACCESS =
            new ProjectAccessInfo(null, false, false, false);

    private static ProjectAccessInfo accessFromEffectiveRole(String role) {
        if (role == null) {
            return NO_PROJECT_ACCESS;
        }
        if (ROLE_ADMIN.equalsIgnoreCase(role)) {
            return new ProjectAccessInfo(ROLE_ADMIN, true, true, true);
        }
        return accessFromProjectRole(role);
    }

    private static ProjectAccessInfo accessAfterCreate(
            WorkspaceMember membership, User projectLead, User currentUser) {
        if (ROLE_ADMIN.equalsIgnoreCase(membership.getRole().getRoleName())) {
            return new ProjectAccessInfo(ROLE_ADMIN, true, true, true);
        }
        if (projectLead.getId().equals(currentUser.getId())) {
            return accessFromProjectRole(ROLE_PM);
        }
        return accessFromProjectRole("Member");
    }

    private static ProjectAccessInfo accessFromProjectRole(String role) {
        boolean pm = ROLE_PM.equalsIgnoreCase(role);
        boolean lead = ROLE_LEAD.equalsIgnoreCase(role);
        return new ProjectAccessInfo(role, pm || lead, true, pm);
    }

    private User resolveProjectLead(Long workspaceId, Long requestedLeadUserId, User currentUser) {
        Long leadId = requestedLeadUserId != null ? requestedLeadUserId : currentUser.getId();
        if (leadId.equals(currentUser.getId())) {
            return currentUser;
        }
        User lead = userRepository
                .findById(leadId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, lead.getId())) {
            throw new BusinessException(
                    ErrorCode.PROJECT_FORBIDDEN, "Project Lead phải là thành viên của phòng ban");
        }
        return lead;
    }

    private void ensureProjectLeadMembership(Project project, User lead) {
        projectMemberRepository
                .findByProjectIdAndUserId(project.getId(), lead.getId())
                .ifPresentOrElse(
                        member -> {
                            member.setRole(projectMemberService.requireProjectRole(ROLE_PM));
                            projectMemberRepository.save(member);
                        },
                        () -> projectMemberService.addMember(project, lead, ROLE_PM, true));
    }

    private boolean isPriorityOnlyUpdate(UpdateProjectRequest request) {
        if (request.getPriorityName() == null || request.getPriorityName().isBlank()) {
            return false;
        }
        return isOnlyMetaFieldsSet(request, "priority");
    }

    private boolean isStatusOnlyUpdate(UpdateProjectRequest request) {
        if (request.getStatusName() == null || request.getStatusName().isBlank()) {
            return false;
        }
        return isOnlyMetaFieldsSet(request, "status");
    }

    private boolean isPrivacyOnlyUpdate(UpdateProjectRequest request) {
        if (request.getPrivacyMode() == null || request.getPrivacyMode().isBlank()) {
            return false;
        }
        return isOnlyMetaFieldsSet(request, "privacy");
    }

    private boolean isOnlyMetaFieldsSet(UpdateProjectRequest request, String field) {
        boolean prioritySet =
                request.getPriorityName() != null && !request.getPriorityName().isBlank();
        boolean statusSet = request.getStatusName() != null && !request.getStatusName().isBlank();
        boolean privacySet =
                request.getPrivacyMode() != null && !request.getPrivacyMode().isBlank();
        int metaCount = (prioritySet ? 1 : 0) + (statusSet ? 1 : 0) + (privacySet ? 1 : 0);
        if (metaCount != 1) {
            return false;
        }
        return switch (field) {
            case "priority" -> prioritySet;
            case "status" -> statusSet;
            case "privacy" -> privacySet;
            default -> false;
        }
                && request.getName() == null
                && request.getDescription() == null
                && request.getStartDate() == null
                && request.getEndDate() == null
                && request.getColorCode() == null
                && request.getProjectLeadUserId() == null
                && otherMetaFieldsUnset(request, field);
    }

    private boolean otherMetaFieldsUnset(UpdateProjectRequest request, String except) {
        boolean prioritySet =
                request.getPriorityName() != null && !request.getPriorityName().isBlank();
        boolean statusSet = request.getStatusName() != null && !request.getStatusName().isBlank();
        boolean privacySet =
                request.getPrivacyMode() != null && !request.getPrivacyMode().isBlank();
        if (!"priority".equals(except) && prioritySet) {
            return false;
        }
        if (!"status".equals(except) && statusSet) {
            return false;
        }
        return "privacy".equals(except) || !privacySet;
    }

    private ProjectStatus resolveStatus(String statusName) {
        return lookupCacheService.requireProjectStatus(statusName, STATUS_ACTIVE);
    }

    private ProjectPriority resolvePriority(String priorityName) {
        return lookupCacheService.requireProjectPriority(priorityName, DEFAULT_PRIORITY);
    }

    private String resolveProjectCode(String workspaceCode, String projectName, String manualCode) {
        String base = manualCode != null && !manualCode.isBlank()
                ? SlugUtils.sanitizeManualDepartmentCode(manualCode)
                : SlugUtils.toDepartmentCode(projectName);
        String prefix = workspaceCode + "-" + base;
        Set<String> existing = new HashSet<>();
        for (String existingCode : projectRepository.findExistingCodesByPrefix(prefix)) {
            existing.add(existingCode.toLowerCase());
        }
        if (!existing.contains(prefix.toLowerCase())) {
            return truncateCode(prefix);
        }
        for (int suffix = 2; suffix <= 500; suffix++) {
            String candidate = prefix + suffix;
            if (!existing.contains(candidate.toLowerCase())) {
                return truncateCode(candidate);
            }
        }
        return truncateCode(prefix + (System.currentTimeMillis() % 100000));
    }

    private static String truncateCode(String code) {
        return code.length() > 50 ? code.substring(0, 50) : code;
    }

    private String resolveProjectSlug(String workspaceSlug, String projectName, String manualSlug) {
        String part = manualSlug != null && !manualSlug.isBlank()
                ? SlugUtils.toSlug(manualSlug.trim())
                : SlugUtils.toSlug(projectName);
        String prefix = workspaceSlug + "-" + part;
        Set<String> existing = new HashSet<>();
        for (String existingSlug : projectRepository.findExistingSlugsByPrefix(prefix)) {
            existing.add(existingSlug.toLowerCase());
        }
        if (!existing.contains(prefix.toLowerCase())) {
            return truncateSlug(prefix);
        }
        String candidate = prefix + "-" + System.currentTimeMillis() % 10000;
        while (existing.contains(candidate.toLowerCase())) {
            candidate = prefix + "-" + System.currentTimeMillis() % 10000;
        }
        return truncateSlug(candidate);
    }

    private static String truncateSlug(String slug) {
        return slug.length() > 150 ? slug.substring(0, 150) : slug;
    }

    private void validateDateRange(Instant start, Instant end) {
        if (start != null && end != null && end.isBefore(start)) {
            throw new BusinessException(ErrorCode.PROJECT_DATE_RANGE_INVALID);
        }
    }

    private Instant toInstantStart(LocalDate date) {
        return date == null ? null : date.atStartOfDay(ZoneOffset.UTC).toInstant();
    }

    private Instant toInstantEnd(LocalDate date) {
        return date == null ? null : date.atTime(23, 59, 59).toInstant(ZoneOffset.UTC);
    }

    private String normalizePrivacy(String privacy) {
        if (privacy == null || privacy.isBlank()) {
            return PRIVACY_PRIVATE;
        }
        String p = privacy.trim().toUpperCase();
        if (!p.equals(PRIVACY_PRIVATE) && !p.equals("ORG_WIDE")) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "privacyMode chỉ nhận PRIVATE hoặc ORG_WIDE");
        }
        return p;
    }

    private String normalizeColor(String color) {
        if (color == null || color.isBlank()) {
            return "#2563EB";
        }
        return color.trim();
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private ProjectSummaryResponse toSummary(Project project, Long workspaceId, String myRole) {
        return ProjectSummaryResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .code(project.getCode())
                .slug(project.getSlug())
                .colorCode(project.getColorCode())
                .statusName(project.getStatus() != null ? project.getStatus().getStatusName() : null)
                .priorityName(project.getPriority() != null ? project.getPriority().getName() : null)
                .priorityColorCode(project.getPriority() != null ? project.getPriority().getColorCode() : null)
                .priorityWeight(project.getPriority() != null ? project.getPriority().getWeight() : null)
                .myRole(myRole)
                .workspaceId(workspaceId)
                .build();
    }

    private ProjectResponse toDetail(Project project, ProjectAccessInfo access) {
        return ProjectResponse.builder()
                .id(project.getId())
                .workspaceId(project.getWorkspace().getId())
                .name(project.getName())
                .code(project.getCode())
                .slug(project.getSlug())
                .description(project.getDescription())
                .statusName(project.getStatus() != null ? project.getStatus().getStatusName() : null)
                .statusColorCode(
                        project.getStatus() != null ? project.getStatus().getColorCode() : null)
                .priorityName(project.getPriority() != null ? project.getPriority().getName() : null)
                .priorityColorCode(project.getPriority() != null ? project.getPriority().getColorCode() : null)
                .priorityWeight(project.getPriority() != null ? project.getPriority().getWeight() : null)
                .colorCode(project.getColorCode())
                .privacyMode(project.getPrivacyMode())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .projectLeadUserId(
                        project.getProjectManager() != null ? project.getProjectManager().getId() : null)
                .projectManagerUsername(
                        project.getProjectManager() != null
                                ? project.getProjectManager().getUsername()
                                : null)
                .myRole(access.myRole())
                .canManage(access.canManage())
                .canEditPriority(access.canEditPriority())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    private ProjectMemberResponse toMemberResponse(ProjectMember member) {
        return ProjectMemberResponse.builder()
                .userId(member.getUser().getId())
                .username(member.getUser().getUsername())
                .email(member.getUser().getEmail())
                .roleName(member.getRole().getRoleName())
                .joinedAt(member.getJoinedAt())
                .build();
    }
}
