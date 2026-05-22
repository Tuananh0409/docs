package com.example.pms.backend.service;

import com.example.pms.backend.entity.Project;
import com.example.pms.backend.entity.User;
import com.example.pms.backend.entity.WorkspaceMember;
import com.example.pms.backend.exception.BusinessException;
import com.example.pms.backend.exception.ErrorCode;
import com.example.pms.backend.repository.ProjectMemberRepository;
import com.example.pms.backend.repository.ProjectRepository;
import com.example.pms.backend.repository.WorkspaceMemberRepository;
import com.example.pms.backend.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProjectAccessGuard {

    private static final String ROLE_ADMIN = "Admin";
    private static final String ROLE_PM = "PM";
    private static final String ROLE_VIEWER = "Viewer";

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceRepository workspaceRepository;

    public Project loadProject(Long workspaceId, Long projectId) {
        return projectRepository
                .findByIdAndWorkspaceIdAndDeletedFalse(projectId, workspaceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
    }

    public WorkspaceMember requireWorkspaceMember(Long workspaceId, Long userId) {
        workspaceRepository
                .findByIdAndDeletedFalse(workspaceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WORKSPACE_NOT_FOUND));
        return workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WORKSPACE_FORBIDDEN));
    }

    public void requireProjectAccess(Project project, Long userId) {
        if (isWorkspaceAdmin(project.getWorkspace().getId(), userId)) {
            return;
        }
        if (projectMemberRepository.findByProjectIdAndUserId(project.getId(), userId).isPresent()) {
            return;
        }
        throw new BusinessException(ErrorCode.PROJECT_FORBIDDEN);
    }

    public void requireProjectWriteAccess(Project project, Long userId) {
        if (isWorkspaceAdmin(project.getWorkspace().getId(), userId)) {
            return;
        }
        projectMemberRepository
                .findByProjectIdAndUserId(project.getId(), userId)
                .filter(m -> {
                    String role = m.getRole().getRoleName();
                    return !ROLE_VIEWER.equalsIgnoreCase(role);
                })
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_FORBIDDEN));
    }

    public boolean isWorkspaceAdmin(Long workspaceId, Long userId) {
        return workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, userId)
                .map(m -> ROLE_ADMIN.equalsIgnoreCase(m.getRole().getRoleName()))
                .orElse(false);
    }

    public boolean canManageProject(Project project, User user) {
        if (isWorkspaceAdmin(project.getWorkspace().getId(), user.getId())) {
            return true;
        }
        return projectMemberRepository
                .findByProjectIdAndUserId(project.getId(), user.getId())
                .map(m -> {
                    String role = m.getRole().getRoleName();
                    return ROLE_PM.equalsIgnoreCase(role) || "Lead".equalsIgnoreCase(role);
                })
                .orElse(false);
    }
}
