package com.example.pms.backend.service;

import com.example.pms.backend.dto.workspace.CreateWorkspaceRequest;
import com.example.pms.backend.dto.workspace.DeleteWorkspaceRequest;
import com.example.pms.backend.dto.workspace.InvitationResponse;
import com.example.pms.backend.dto.workspace.InviteMemberRequest;
import com.example.pms.backend.dto.workspace.MemberResponse;
import com.example.pms.backend.dto.workspace.UpdateMemberRoleRequest;
import com.example.pms.backend.dto.workspace.UpdateWorkspaceRequest;
import com.example.pms.backend.dto.workspace.WorkspaceResponse;
import com.example.pms.backend.entity.User;
import com.example.pms.backend.entity.Workspace;
import com.example.pms.backend.entity.WorkspaceInvitation;
import com.example.pms.backend.entity.WorkspaceMember;
import com.example.pms.backend.entity.WorkspaceRole;
import com.example.pms.backend.exception.BusinessException;
import com.example.pms.backend.exception.ErrorCode;
import com.example.pms.backend.repository.ProjectRepository;
import com.example.pms.backend.repository.UserRepository;
import com.example.pms.backend.repository.WorkspaceInvitationRepository;
import com.example.pms.backend.repository.WorkspaceMemberRepository;
import com.example.pms.backend.repository.WorkspaceRepository;
import com.example.pms.backend.security.CurrentUserProvider;
import com.example.pms.backend.util.SlugUtils;
import com.example.pms.backend.workspace.WorkspacePrivacy;
import java.net.URI;
import java.time.Instant;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private static final String ROLE_ADMIN = "Admin";
    private static final String STATUS_PENDING = "pending";
    private static final String STATUS_ACCEPTED = "accepted";
    private static final String STATUS_DECLINED = "declined";
    private static final String STATUS_EXPIRED = "expired";
    private static final String SYSTEM_ADMIN_EMAIL = "admin@ctel.local";

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceInvitationRepository workspaceInvitationRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final CurrentUserProvider currentUserProvider;
    private final WorkspaceMapper workspaceMapper;
    private final LookupCacheService lookupCacheService;

    @Transactional
    public WorkspaceResponse create(CreateWorkspaceRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();

        if (!isSystemAdmin(currentUser)) {
            throw new BusinessException(ErrorCode.WORKSPACE_FORBIDDEN, "Chỉ admin hệ thống mới được tạo workspace");
        }

        String name = request.getName().trim();
        if (workspaceRepository.existsByNameIgnoreCase(name)) {
            throw new BusinessException(ErrorCode.WORKSPACE_NAME_EXISTS);
        }

        String code = request.getCode() != null && !request.getCode().isBlank()
                ? SlugUtils.sanitizeManualDepartmentCode(request.getCode())
                : SlugUtils.toDepartmentCode(request.getName());
        String slug = request.getSlug() != null && !request.getSlug().isBlank()
                ? SlugUtils.toSlug(request.getSlug().trim())
                : SlugUtils.toSlug(request.getName());

        code = resolveUniqueCode(code);
        slug = resolveUniqueSlug(slug);

        if (request.getPrivacyMode() != null
                && !request.getPrivacyMode().isBlank()
                && !WorkspacePrivacy.isAllowed(request.getPrivacyMode())) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_ERROR,
                    "privacyMode chỉ nhận PRIVATE hoặc ORG_WIDE");
        }
        String privacy = WorkspacePrivacy.normalizeOrDefault(request.getPrivacyMode());
        String themeColor = normalizeThemeColor(request.getThemeColor());
        String timezone = resolveTimezone(request.getTimezone());
        Workspace workspace = Workspace.builder()
                .name(name)
                .description(request.getDescription())
                .code(code)
                .slug(slug)
                .logoUrl(null)
                .owner(currentUser)
                .privacyMode(privacy)
                .themeColor(themeColor)
                .timezone(timezone)
                .status("active")
                .deleted(false)
                .build();

        workspace = workspaceRepository.save(workspace);

        WorkspaceRole adminRole = lookupCacheService.requireWorkspaceRole(ROLE_ADMIN);
        workspaceMemberRepository.save(WorkspaceMember.builder()
                .workspace(workspace)
                .user(currentUser)
                .role(adminRole)
                .joinedAt(Instant.now())
                .build());

        return workspaceMapper.toResponse(workspace, ROLE_ADMIN);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceResponse> listMine() {
        User currentUser = currentUserProvider.getCurrentUser();
        return workspaceRepository.findAllAccessibleWithMyRoleByUserId(currentUser.getId()).stream()
                .map(row -> workspaceMapper.toResponse((Workspace) row[0], (String) row[1]))
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkspaceResponse getById(Long workspaceId) {
        User currentUser = currentUserProvider.getCurrentUser();
        WorkspaceMember membership = loadMembership(workspaceId, currentUser.getId());
        return workspaceMapper.toResponse(
                membership.getWorkspace(), membership.getRole().getRoleName());
    }

    @Transactional
    public WorkspaceResponse update(Long workspaceId, UpdateWorkspaceRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        WorkspaceMember membership = loadAdminMembership(workspaceId, currentUser.getId());
        Workspace workspace = membership.getWorkspace();

        if (request.getName() != null && !request.getName().isBlank()) {
            String newName = request.getName().trim();
            if (workspaceRepository.existsByNameIgnoreCaseAndDeletedFalseAndIdNot(newName, workspaceId)) {
                throw new BusinessException(ErrorCode.WORKSPACE_NAME_EXISTS);
            }
            workspace.setName(newName);
        }
        if (request.getDescription() != null) {
            workspace.setDescription(request.getDescription());
        }
        if (request.getLogoUrl() != null && request.getLogoUrl().isBlank()) {
            workspace.setLogoUrl(null);
        }
        if (request.getPrivacyMode() != null && !request.getPrivacyMode().isBlank()) {
            if (!WorkspacePrivacy.isAllowed(request.getPrivacyMode())) {
                throw new BusinessException(
                        ErrorCode.VALIDATION_ERROR,
                        "privacyMode chỉ nhận PRIVATE hoặc ORG_WIDE");
            }
            workspace.setPrivacyMode(
                    WorkspacePrivacy.normalizeOrDefault(request.getPrivacyMode()));
        }
        if (request.getThemeColor() != null) {
            workspace.setThemeColor(
                    request.getThemeColor().isBlank()
                            ? null
                            : normalizeThemeColor(request.getThemeColor()));
        }
        if (request.getStatus() != null) {
            workspace.setStatus(request.getStatus());
        }
        if (request.getTimezone() != null && !request.getTimezone().isBlank()) {
            workspace.setTimezone(resolveTimezone(request.getTimezone()));
        }

        workspace = workspaceRepository.save(workspace);
        return workspaceMapper.toResponse(workspace, membership.getRole().getRoleName());
    }

    @Transactional
    public void delete(Long workspaceId, DeleteWorkspaceRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        requireWorkspaceAdmin(workspaceId, currentUser.getId());
        Workspace workspace = getActiveWorkspaceWithOwner(workspaceId);

        if (!workspace.getName().equals(request.getConfirmName().trim())) {
            throw new BusinessException(ErrorCode.WORKSPACE_DELETE_NAME_MISMATCH);
        }

        if (projectRepository.countActiveProjectsByWorkspaceId(workspaceId) > 0) {
            throw new BusinessException(ErrorCode.WORKSPACE_HAS_ACTIVE_PROJECTS);
        }

        workspace.setDeleted(true);
        workspace.setStatus("archived");
        workspaceRepository.save(workspace);
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> listMembers(Long workspaceId) {
        User currentUser = currentUserProvider.getCurrentUser();
        requireMember(workspaceId, currentUser.getId());
        return workspaceMemberRepository.findByWorkspaceIdWithDetails(workspaceId).stream()
                .map(workspaceMapper::toMemberResponse)
                .toList();
    }

    @Transactional
    public InvitationResponse inviteMember(Long workspaceId, InviteMemberRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        requireWorkspaceAdmin(workspaceId, currentUser.getId());
        Workspace workspace = getActiveWorkspaceWithOwner(workspaceId);

        String email = request.getEmail().trim().toLowerCase();
        User invitee = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVITE_EMAIL_NOT_FOUND));

        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, invitee.getId())) {
            throw new BusinessException(ErrorCode.MEMBER_ALREADY_EXISTS);
        }

        if (workspaceInvitationRepository.existsByWorkspaceIdAndEmailIgnoreCaseAndStatus(
                workspaceId, email, STATUS_PENDING)) {
            throw new BusinessException(ErrorCode.MEMBER_ALREADY_EXISTS, "Đã có lời mời đang chờ xác nhận");
        }

        WorkspaceRole role = lookupCacheService.requireWorkspaceRole(request.getRoleName());

        WorkspaceInvitation invitation = WorkspaceInvitation.builder()
                .workspace(workspace)
                .email(email)
                .inviter(currentUser)
                .role(role)
                .status(STATUS_PENDING)
                .token(UUID.randomUUID().toString().replace("-", ""))
                .expiredAt(Instant.now().plus(48, ChronoUnit.HOURS))
                .build();

        invitation = workspaceInvitationRepository.save(invitation);
        return workspaceMapper.toInvitationResponse(invitation);
    }

    @Transactional(readOnly = true)
    public List<InvitationResponse> listPendingInvitations(Long workspaceId) {
        User currentUser = currentUserProvider.getCurrentUser();
        requireWorkspaceAdmin(workspaceId, currentUser.getId());
        return workspaceInvitationRepository
                .findByWorkspaceIdAndStatusWithDetails(workspaceId, STATUS_PENDING)
                .stream()
                .map(workspaceMapper::toInvitationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InvitationResponse> listMyPendingInvitations() {
        User currentUser = currentUserProvider.getCurrentUser();
        Instant now = Instant.now();
        return workspaceInvitationRepository
                .findPendingWithDetailsByEmail(currentUser.getEmail(), STATUS_PENDING)
                .stream()
                .filter(invitation -> !invitation.getWorkspace().getDeleted())
                .filter(invitation -> invitation.getExpiredAt() == null || invitation.getExpiredAt().isAfter(now))
                .map(workspaceMapper::toInvitationResponse)
                .toList();
    }

    @Transactional
    public WorkspaceResponse acceptInvitation(String token) {
        User currentUser = currentUserProvider.getCurrentUser();
        WorkspaceInvitation invitation = getValidPendingInvitation(token);

        if (!invitation.getEmail().equalsIgnoreCase(currentUser.getEmail())) {
            throw new BusinessException(ErrorCode.WORKSPACE_FORBIDDEN, "Lời mời không dành cho tài khoản này");
        }

        Workspace workspace = invitation.getWorkspace();
        if (workspace.getDeleted()) {
            throw new BusinessException(ErrorCode.INVITATION_WORKSPACE_GONE);
        }

        String roleName = invitation.getRole().getRoleName();
        var existingMember = workspaceMemberRepository.findByWorkspaceIdAndUserIdWithUserAndRole(
                workspace.getId(), currentUser.getId());
        if (existingMember.isPresent()) {
            invitation.setStatus(STATUS_ACCEPTED);
            workspaceInvitationRepository.save(invitation);
            return workspaceMapper.toResponse(
                    workspace, existingMember.get().getRole().getRoleName());
        }

        workspaceMemberRepository.save(WorkspaceMember.builder()
                .workspace(workspace)
                .user(currentUser)
                .role(invitation.getRole())
                .joinedAt(Instant.now())
                .build());

        invitation.setStatus(STATUS_ACCEPTED);
        workspaceInvitationRepository.save(invitation);

        return workspaceMapper.toResponse(workspace, roleName);
    }

    @Transactional
    public void declineInvitation(String token) {
        User currentUser = currentUserProvider.getCurrentUser();
        WorkspaceInvitation invitation = getValidPendingInvitation(token);

        if (!invitation.getEmail().equalsIgnoreCase(currentUser.getEmail())) {
            throw new BusinessException(ErrorCode.WORKSPACE_FORBIDDEN, "Lời mời không dành cho tài khoản này");
        }

        invitation.setStatus(STATUS_DECLINED);
        workspaceInvitationRepository.save(invitation);
    }

    @Transactional
    public MemberResponse updateMemberRole(Long workspaceId, Long targetUserId, UpdateMemberRoleRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        requireWorkspaceAdmin(workspaceId, currentUser.getId());

        WorkspaceMember member = workspaceMemberRepository
                .findByWorkspaceIdAndUserIdWithUserAndRole(workspaceId, targetUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "Thành viên không tồn tại"));

        WorkspaceRole newRole = lookupCacheService.requireWorkspaceRole(request.getRoleName());
        String oldRoleName = member.getRole().getRoleName();
        String newRoleName = newRole.getRoleName();
        boolean demotingLastAdmin =
                ROLE_ADMIN.equalsIgnoreCase(oldRoleName) && !ROLE_ADMIN.equalsIgnoreCase(newRoleName);

        if (demotingLastAdmin && workspaceMemberRepository.countAdminsByWorkspaceId(workspaceId) <= 1) {
            throw new BusinessException(ErrorCode.WORKSPACE_MIN_ONE_ADMIN);
        }

        member.setRole(newRole);
        member = workspaceMemberRepository.save(member);
        return workspaceMapper.toMemberResponse(member);
    }

    @Transactional
    public void removeMember(Long workspaceId, Long targetUserId) {
        User currentUser = currentUserProvider.getCurrentUser();
        requireWorkspaceAdmin(workspaceId, currentUser.getId());

        WorkspaceMember member = workspaceMemberRepository
                .findByWorkspaceIdAndUserIdWithUserAndRole(workspaceId, targetUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "Thành viên không tồn tại"));

        if (ROLE_ADMIN.equalsIgnoreCase(member.getRole().getRoleName())
                && workspaceMemberRepository.countAdminsByWorkspaceId(workspaceId) <= 1) {
            throw new BusinessException(ErrorCode.WORKSPACE_MIN_ONE_ADMIN);
        }

        workspaceMemberRepository.delete(member);
    }

    @Transactional
    public void leaveWorkspace(Long workspaceId) {
        User currentUser = currentUserProvider.getCurrentUser();

        WorkspaceMember member = loadMembership(workspaceId, currentUser.getId());

        if (ROLE_ADMIN.equalsIgnoreCase(member.getRole().getRoleName())
                && workspaceMemberRepository.countAdminsByWorkspaceId(workspaceId) <= 1) {
            throw new BusinessException(ErrorCode.LAST_ADMIN_CANNOT_LEAVE);
        }

        workspaceMemberRepository.delete(member);
    }

    private WorkspaceInvitation getValidPendingInvitation(String token) {
        WorkspaceInvitation invitation = workspaceInvitationRepository
                .findByTokenWithDetails(token)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVITATION_INVALID));

        if (!STATUS_PENDING.equals(invitation.getStatus())) {
            throw new BusinessException(ErrorCode.INVITATION_INVALID);
        }

        if (Instant.now().isAfter(invitation.getExpiredAt())) {
            invitation.setStatus(STATUS_EXPIRED);
            workspaceInvitationRepository.save(invitation);
            throw new BusinessException(ErrorCode.INVITATION_INVALID);
        }

        return invitation;
    }

    private Workspace getActiveWorkspaceWithOwner(Long workspaceId) {
        return workspaceRepository
                .findByIdAndDeletedFalseWithOwner(workspaceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WORKSPACE_NOT_FOUND));
    }

    private WorkspaceMember loadMembership(Long workspaceId, Long userId) {
        return workspaceMemberRepository
                .findByWorkspaceIdAndUserIdWithDetails(workspaceId, userId)
                .filter(m -> !Boolean.TRUE.equals(m.getWorkspace().getDeleted()))
                .orElseThrow(() -> new BusinessException(ErrorCode.WORKSPACE_FORBIDDEN));
    }

    private WorkspaceMember loadAdminMembership(Long workspaceId, Long userId) {
        WorkspaceMember membership = loadMembership(workspaceId, userId);
        if (!ROLE_ADMIN.equalsIgnoreCase(membership.getRole().getRoleName())) {
            throw new BusinessException(ErrorCode.WORKSPACE_FORBIDDEN);
        }
        return membership;
    }

    private void requireMember(Long workspaceId, Long userId) {
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw new BusinessException(ErrorCode.WORKSPACE_FORBIDDEN);
        }
    }

    private void requireWorkspaceAdmin(Long workspaceId, Long userId) {
        if (!workspaceMemberRepository.isWorkspaceAdmin(workspaceId, userId)) {
            throw new BusinessException(ErrorCode.WORKSPACE_FORBIDDEN);
        }
    }

    private String resolveUniqueCode(String baseCode) {
        Set<String> existing = new HashSet<>();
        for (String code : workspaceRepository.findExistingCodesByPrefix(baseCode)) {
            existing.add(code.toLowerCase());
        }
        if (!existing.contains(baseCode.toLowerCase())) {
            return truncateCode(baseCode);
        }
        for (int suffix = 2; suffix <= 500; suffix++) {
            String candidate = baseCode + suffix;
            if (!existing.contains(candidate.toLowerCase())) {
                return truncateCode(candidate);
            }
        }
        return truncateCode(baseCode + (System.currentTimeMillis() % 100000));
    }

    private String resolveUniqueSlug(String baseSlug) {
        Set<String> existing = new HashSet<>();
        for (String slug : workspaceRepository.findExistingSlugsByPrefix(baseSlug)) {
            existing.add(slug.toLowerCase());
        }
        if (!existing.contains(baseSlug.toLowerCase())) {
            return truncateSlug(baseSlug);
        }
        for (int suffix = 2; suffix <= 500; suffix++) {
            String candidate = baseSlug + "-" + suffix;
            if (!existing.contains(candidate.toLowerCase())) {
                return truncateSlug(candidate);
            }
        }
        return truncateSlug(baseSlug + "-" + (System.currentTimeMillis() % 10000));
    }

    private static String truncateCode(String code) {
        return code.length() > 50 ? code.substring(0, 50) : code;
    }

    private static String truncateSlug(String slug) {
        return slug.length() > 150 ? slug.substring(0, 150) : slug;
    }

    /** #RGB / #RRGGBB hoặc rỗng. */
    private String normalizeThemeColor(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String s = raw.trim();
        if (!s.startsWith("#")) {
            s = "#" + s;
        }
        if (!s.matches("^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$")) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "themeColor: dùng #RGB hoặc #RRGGBB");
        }
        if (s.length() == 4) {
            return "#" + s.charAt(1) + s.charAt(1) + s.charAt(2) + s.charAt(2) + s.charAt(3) + s.charAt(3);
        }
        return s.toUpperCase(java.util.Locale.ROOT);
    }

    private String resolveTimezone(String raw) {
        if (raw == null || raw.isBlank()) {
            return "Asia/Ho_Chi_Minh";
        }
        try {
            return ZoneId.of(raw.trim()).getId();
        } catch (RuntimeException ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "timezone không hợp lệ (IANA, ví dụ Asia/Ho_Chi_Minh)");
        }
    }

    private boolean isSystemAdmin(User user) {
        if (user == null) {
            return false;
        }
        if (user.getId() != null && user.getId() == 1L) {
            return true;
        }
        return user.getEmail() != null
                && SYSTEM_ADMIN_EMAIL.equalsIgnoreCase(user.getEmail().trim());
    }
}
