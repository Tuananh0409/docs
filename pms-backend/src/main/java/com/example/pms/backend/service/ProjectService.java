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
import com.example.pms.backend.repository.ProjectRoleRepository;
import com.example.pms.backend.repository.ProjectPriorityRepository;
import com.example.pms.backend.repository.ProjectStatusRepository;
import com.example.pms.backend.repository.UserRepository;
import com.example.pms.backend.repository.WorkspaceMemberRepository;
import com.example.pms.backend.repository.WorkspaceRepository;
import com.example.pms.backend.security.CurrentUserProvider;
import com.example.pms.backend.util.SlugUtils;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private static final String ROLE_ADMIN = "Admin";
    private static final String ROLE_PM = "PM";
    private static final String STATUS_ACTIVE = "Active";
    private static final String PRIVACY_PRIVATE = "PRIVATE";
    private static final String DEFAULT_PRIORITY = "Medium";

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRoleRepository projectRoleRepository;
    private final ProjectStatusRepository projectStatusRepository;
    private final ProjectPriorityRepository projectPriorityRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final ProjectMemberService projectMemberService;
    private final CurrentUserProvider currentUserProvider;

    @Transactional(readOnly = true)
    public List<ProjectSummaryResponse> listByWorkspace(Long workspaceId) {
        User currentUser = currentUserProvider.getCurrentUser();
        requireWorkspaceMember(workspaceId, currentUser.getId());

        return projectRepository
                .findVisibleByWorkspaceIdAndUserId(workspaceId, currentUser.getId())
                .stream()
                .map(project -> toSummary(project, currentUser.getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getById(Long workspaceId, Long projectId) {
        User currentUser = currentUserProvider.getCurrentUser();
        Project project = loadProject(workspaceId, projectId);
        requireProjectAccess(project, currentUser.getId());
        return toDetail(project, currentUser.getId());
    }

    @Transactional
    public ProjectResponse create(Long workspaceId, CreateProjectRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        WorkspaceMember membership = requireWorkspaceMember(workspaceId, currentUser.getId());
        requireCanCreateProject(membership);

        Workspace workspace = workspaceRepository
                .findByIdAndDeletedFalse(workspaceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WORKSPACE_NOT_FOUND));

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
        projectMemberService.addMember(project, projectLead, ROLE_PM);
        if (!projectLead.getId().equals(currentUser.getId())) {
            projectMemberService.addMember(project, currentUser, "Member");
        }

        return toDetail(project, currentUser.getId());
    }

    @Transactional
    public ProjectResponse update(Long workspaceId, Long projectId, UpdateProjectRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        Project project = loadProject(workspaceId, projectId);
        if (isPriorityOnlyUpdate(request)) {
            requireProjectAccess(project, currentUser.getId());
        } else if (isStatusOnlyUpdate(request) || isPrivacyOnlyUpdate(request)) {
            requireProjectManage(project, currentUser.getId());
        } else {
            requireProjectManage(project, currentUser.getId());
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
        project = reloadProjectWithDetails(workspaceId, project.getId());
        return toDetail(project, currentUser.getId());
    }

    @Transactional
    public void delete(Long workspaceId, Long projectId) {
        User currentUser = currentUserProvider.getCurrentUser();
        Project project = loadProject(workspaceId, projectId);
        if (!isWorkspaceAdmin(workspaceId, currentUser.getId())) {
            throw new BusinessException(ErrorCode.PROJECT_FORBIDDEN);
        }
        project.setDeleted(true);
        projectRepository.save(project);
    }

    @Transactional(readOnly = true)
    public List<ProjectMemberResponse> listMembers(Long workspaceId, Long projectId) {
        User currentUser = currentUserProvider.getCurrentUser();
        Project project = loadProject(workspaceId, projectId);
        requireProjectAccess(project, currentUser.getId());

        return projectMemberRepository.findByProjectIdOrderByJoinedAtAsc(projectId).stream()
                .map(this::toMemberResponse)
                .toList();
    }

    @Transactional
    public ProjectMemberResponse addMember(
            Long workspaceId, Long projectId, AddProjectMemberRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        Project project = loadProject(workspaceId, projectId);
        requireProjectManage(project, currentUser.getId());

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
        Project project = loadProject(workspaceId, projectId);
        requireProjectManage(project, currentUser.getId());

        ProjectMember member = projectMemberRepository
                .findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "Thành viên không thuộc dự án"));

        ProjectRole newRole = projectRoleRepository
                .findByRoleNameIgnoreCase(request.getRoleName().trim())
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.VALIDATION_ERROR, "Vai trò project không hợp lệ: " + request.getRoleName()));

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
        Project project = loadProject(workspaceId, projectId);
        requireProjectManage(project, currentUser.getId());

        ProjectMember member = projectMemberRepository
                .findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "Thành viên không thuộc dự án"));

        if (ROLE_PM.equalsIgnoreCase(member.getRole().getRoleName())
                && projectMemberRepository.countPmByProjectId(projectId) <= 1) {
            throw new BusinessException(ErrorCode.PROJECT_LAST_PM);
        }

        projectMemberRepository.delete(member);
    }

    private Project loadProject(Long workspaceId, Long projectId) {
        return reloadProjectWithDetails(workspaceId, projectId);
    }

    private Project reloadProjectWithDetails(Long workspaceId, Long projectId) {
        return projectRepository
                .findByIdAndWorkspaceIdWithDetails(projectId, workspaceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
    }

    private WorkspaceMember requireWorkspaceMember(Long workspaceId, Long userId) {
        workspaceRepository
                .findByIdAndDeletedFalse(workspaceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WORKSPACE_NOT_FOUND));

        return workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WORKSPACE_FORBIDDEN));
    }

    private void requireCanCreateProject(WorkspaceMember membership) {
        String role = membership.getRole().getRoleName();
        if (ROLE_ADMIN.equalsIgnoreCase(role) || "Member".equalsIgnoreCase(role)) {
            return;
        }
        throw new BusinessException(ErrorCode.PROJECT_FORBIDDEN, "Bạn không có quyền tạo dự án");
    }

    private void requireProjectAccess(Project project, Long userId) {
        if (isWorkspaceAdmin(project.getWorkspace().getId(), userId)) {
            return;
        }
        if (projectMemberRepository.findByProjectIdAndUserId(project.getId(), userId).isPresent()) {
            return;
        }
        throw new BusinessException(ErrorCode.PROJECT_FORBIDDEN);
    }

    private void requireProjectManage(Project project, Long userId) {
        if (isWorkspaceAdmin(project.getWorkspace().getId(), userId)) {
            return;
        }
        projectMemberRepository
                .findByProjectIdAndUserId(project.getId(), userId)
                .filter(m -> {
                    String role = m.getRole().getRoleName();
                    return ROLE_PM.equalsIgnoreCase(role) || "Lead".equalsIgnoreCase(role);
                })
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_FORBIDDEN));
    }

    private boolean isWorkspaceAdmin(Long workspaceId, Long userId) {
        return workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, userId)
                .map(m -> ROLE_ADMIN.equalsIgnoreCase(m.getRole().getRoleName()))
                .orElse(false);
    }

    private String resolveMyProjectRole(Long projectId, Long userId) {
        return projectMemberRepository
                .findByProjectIdAndUserId(projectId, userId)
                .map(m -> m.getRole().getRoleName())
                .orElse(null);
    }

    private String resolveEffectiveMyRole(Project project, Long userId) {
        if (isWorkspaceAdmin(project.getWorkspace().getId(), userId)) {
            return "Admin";
        }
        return resolveMyProjectRole(project.getId(), userId);
    }

    private boolean canManageProject(Project project, Long userId) {
        if (isWorkspaceAdmin(project.getWorkspace().getId(), userId)) {
            return true;
        }
        return projectMemberRepository
                .findByProjectIdAndUserId(project.getId(), userId)
                .filter(m -> {
                    String role = m.getRole().getRoleName();
                    return ROLE_PM.equalsIgnoreCase(role) || "Lead".equalsIgnoreCase(role);
                })
                .isPresent();
    }

    private boolean canEditProjectPriority(Project project, Long userId) {
        if (canManageProject(project, userId)) {
            return true;
        }
        if (isWorkspaceAdmin(project.getWorkspace().getId(), userId)) {
            return true;
        }
        return projectMemberRepository
                .findByProjectIdAndUserId(project.getId(), userId)
                .isPresent();
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

    private User resolveProjectLead(Long workspaceId, Long requestedLeadUserId, User currentUser) {
        Long leadId = requestedLeadUserId != null ? requestedLeadUserId : currentUser.getId();
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
                            ProjectRole pmRole = projectRoleRepository
                                    .findByRoleNameIgnoreCase(ROLE_PM)
                                    .orElseThrow();
                            member.setRole(pmRole);
                            projectMemberRepository.save(member);
                        },
                        () -> projectMemberService.addMember(project, lead, ROLE_PM));
    }

    private ProjectStatus resolveStatus(String statusName) {
        String name = statusName == null || statusName.isBlank() ? STATUS_ACTIVE : statusName.trim();
        return projectStatusRepository
                .findByStatusNameIgnoreCase(name)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.VALIDATION_ERROR, "Trạng thái dự án không hợp lệ: " + name));
    }

    private ProjectPriority resolvePriority(String priorityName) {
        String name = priorityName == null || priorityName.isBlank() ? DEFAULT_PRIORITY : priorityName.trim();
        return projectPriorityRepository
                .findByNameIgnoreCase(name)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.VALIDATION_ERROR, "Độ ưu tiên dự án không hợp lệ: " + name));
    }

    private String resolveProjectCode(String workspaceCode, String projectName, String manualCode) {
        String base = manualCode != null && !manualCode.isBlank()
                ? SlugUtils.sanitizeManualDepartmentCode(manualCode)
                : SlugUtils.toDepartmentCode(projectName);
        String code = workspaceCode + "-" + base;
        int suffix = 1;
        while (projectRepository.existsByCodeIgnoreCaseAndDeletedFalse(code)) {
            suffix++;
            code = workspaceCode + "-" + base + suffix;
            if (suffix > 500) {
                code = workspaceCode + "-" + (System.currentTimeMillis() % 100000);
                break;
            }
        }
        return code.length() > 50 ? code.substring(0, 50) : code;
    }

    private String resolveProjectSlug(String workspaceSlug, String projectName, String manualSlug) {
        String part = manualSlug != null && !manualSlug.isBlank()
                ? SlugUtils.toSlug(manualSlug.trim())
                : SlugUtils.toSlug(projectName);
        String slug = workspaceSlug + "-" + part;
        if (projectRepository.existsBySlugIgnoreCaseAndDeletedFalse(slug)) {
            slug = slug + "-" + System.currentTimeMillis() % 10000;
        }
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

    private ProjectSummaryResponse toSummary(Project project, Long userId) {
        String myRole = resolveEffectiveMyRole(project, userId);
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
                .workspaceId(project.getWorkspace().getId())
                .build();
    }

    private ProjectResponse toDetail(Project project, Long userId) {
        String role = resolveEffectiveMyRole(project, userId);
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
                .myRole(role)
                .canManage(canManageProject(project, userId))
                .canEditPriority(canEditProjectPriority(project, userId))
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
