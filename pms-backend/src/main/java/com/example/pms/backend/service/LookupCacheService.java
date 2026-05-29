package com.example.pms.backend.service;

import com.example.pms.backend.entity.ProjectPriority;
import com.example.pms.backend.entity.ProjectStatus;
import com.example.pms.backend.entity.TaskPriority;
import com.example.pms.backend.entity.WorkspaceRole;
import com.example.pms.backend.exception.BusinessException;
import com.example.pms.backend.exception.ErrorCode;
import com.example.pms.backend.repository.ProjectPriorityRepository;
import com.example.pms.backend.repository.ProjectStatusRepository;
import com.example.pms.backend.repository.TaskPriorityRepository;
import com.example.pms.backend.repository.WorkspaceRoleRepository;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** In-memory cache cho bảng lookup nhỏ — tránh query lặp mỗi request. */
@Service
@RequiredArgsConstructor
public class LookupCacheService {

    private final ProjectStatusRepository projectStatusRepository;
    private final ProjectPriorityRepository projectPriorityRepository;
    private final TaskPriorityRepository taskPriorityRepository;
    private final WorkspaceRoleRepository workspaceRoleRepository;

    private volatile Map<String, ProjectStatus> projectStatuses;
    private volatile Map<String, ProjectPriority> projectPriorities;
    private volatile Map<String, TaskPriority> taskPriorities;
    private volatile Map<String, WorkspaceRole> workspaceRoles;

    public ProjectStatus requireProjectStatus(String statusName, String defaultName) {
        String key = normalizeKey(statusName, defaultName);
        ensureProjectStatusesLoaded();
        ProjectStatus status = projectStatuses.get(key);
        if (status == null) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_ERROR, "Trạng thái dự án không hợp lệ: " + key);
        }
        return status;
    }

    public ProjectPriority requireProjectPriority(String priorityName, String defaultName) {
        String key = normalizeKey(priorityName, defaultName);
        ensureProjectPrioritiesLoaded();
        ProjectPriority priority = projectPriorities.get(key);
        if (priority == null) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_ERROR, "Độ ưu tiên dự án không hợp lệ: " + key);
        }
        return priority;
    }

    public TaskPriority requireTaskPriority(String priorityName, String defaultName) {
        String key = normalizeKey(mapLegacyTaskPriority(priorityName), defaultName);
        ensureTaskPrioritiesLoaded();
        TaskPriority priority = taskPriorities.get(key);
        if (priority == null) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_ERROR, "Độ ưu tiên không hợp lệ: " + key);
        }
        return priority;
    }

    public WorkspaceRole requireWorkspaceRole(String roleName) {
        String key = roleName.trim().toLowerCase();
        ensureWorkspaceRolesLoaded();
        WorkspaceRole role = workspaceRoles.get(key);
        if (role == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Vai trò không hợp lệ: " + roleName);
        }
        return role;
    }

    private static String normalizeKey(String raw, String defaultName) {
        if (raw == null || raw.isBlank()) {
            return defaultName.toLowerCase();
        }
        return raw.trim().toLowerCase();
    }

    private static String mapLegacyTaskPriority(String raw) {
        if (raw == null || raw.isBlank()) {
            return raw;
        }
        return switch (raw.trim().toLowerCase()) {
            case "urgent" -> "highest";
            case "medium" -> "medium";
            default -> raw.trim().toLowerCase();
        };
    }

    private void ensureProjectStatusesLoaded() {
        if (projectStatuses != null) {
            return;
        }
        synchronized (this) {
            if (projectStatuses == null) {
                projectStatuses = projectStatusRepository.findAll().stream()
                        .collect(Collectors.toMap(
                                s -> s.getStatusName().toLowerCase(), s -> s, (a, b) -> a));
            }
        }
    }

    private void ensureProjectPrioritiesLoaded() {
        if (projectPriorities != null) {
            return;
        }
        synchronized (this) {
            if (projectPriorities == null) {
                projectPriorities = projectPriorityRepository.findAll().stream()
                        .collect(Collectors.toMap(
                                p -> p.getName().toLowerCase(), p -> p, (a, b) -> a));
            }
        }
    }

    private void ensureTaskPrioritiesLoaded() {
        if (taskPriorities != null) {
            return;
        }
        synchronized (this) {
            if (taskPriorities == null) {
                taskPriorities = taskPriorityRepository.findAll().stream()
                        .collect(Collectors.toMap(
                                p -> p.getName().toLowerCase(), p -> p, (a, b) -> a));
            }
        }
    }

    private void ensureWorkspaceRolesLoaded() {
        if (workspaceRoles != null) {
            return;
        }
        synchronized (this) {
            if (workspaceRoles == null) {
                workspaceRoles = workspaceRoleRepository.findAll().stream()
                        .collect(Collectors.toMap(
                                r -> r.getRoleName().toLowerCase(), r -> r, (a, b) -> a));
            }
        }
    }
}
