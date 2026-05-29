package com.example.pms.backend.service;

import com.example.pms.backend.entity.Project;
import com.example.pms.backend.entity.ProjectMember;
import com.example.pms.backend.entity.ProjectRole;
import com.example.pms.backend.entity.User;
import com.example.pms.backend.exception.BusinessException;
import com.example.pms.backend.exception.ErrorCode;
import com.example.pms.backend.repository.ProjectMemberRepository;
import com.example.pms.backend.repository.ProjectRoleRepository;
import com.example.pms.backend.repository.WorkspaceMemberRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Project member helpers — {@code joined_at} is set when adding a member (ERD + FRS aligned).
 * Use from Project APIs when that module is implemented.
 */
@Service
@RequiredArgsConstructor
public class ProjectMemberService {

    private static final String ROLE_PM = "PM";

    private final Map<String, ProjectRole> roleCache = new ConcurrentHashMap<>();

    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRoleRepository projectRoleRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    @Transactional
    public ProjectMember addMember(Project project, User user, String roleName) {
        return addMember(project, user, roleName, false);
    }

    /** Bỏ qua kiểm tra workspace/member trùng khi caller đã validate (vd. lúc tạo project). */
    @Transactional
    public ProjectMember addMember(Project project, User user, String roleName, boolean trustedCreate) {
        if (!trustedCreate) {
            Long workspaceId = project.getWorkspace().getId();
            if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, user.getId())) {
                throw new BusinessException(
                        ErrorCode.WORKSPACE_FORBIDDEN, "User chưa tham gia workspace của dự án này");
            }
            if (projectMemberRepository.findByProjectIdAndUserId(project.getId(), user.getId()).isPresent()) {
                throw new BusinessException(ErrorCode.MEMBER_ALREADY_EXISTS, "User đã là thành viên dự án");
            }
        }

        ProjectRole role = requireProjectRole(roleName);

        return projectMemberRepository.save(ProjectMember.builder()
                .project(project)
                .user(user)
                .role(role)
                .joinedAt(Instant.now())
                .build());
    }

    @Transactional
    public void addMembersOnProjectCreate(Project project, User lead, User creator) {
        List<ProjectMember> members = new ArrayList<>(2);
        Instant joinedAt = Instant.now();
        members.add(ProjectMember.builder()
                .project(project)
                .user(lead)
                .role(requireProjectRole(ROLE_PM))
                .joinedAt(joinedAt)
                .build());
        if (!lead.getId().equals(creator.getId())) {
            members.add(ProjectMember.builder()
                    .project(project)
                    .user(creator)
                    .role(requireProjectRole("Member"))
                    .joinedAt(joinedAt)
                    .build());
        }
        projectMemberRepository.saveAll(members);
    }

    ProjectRole requireProjectRole(String roleName) {
        String key = roleName.trim().toLowerCase();
        return roleCache.computeIfAbsent(key, k -> projectRoleRepository
                .findByRoleNameIgnoreCase(roleName.trim())
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.VALIDATION_ERROR, "Vai trò project không hợp lệ: " + roleName)));
    }
}
