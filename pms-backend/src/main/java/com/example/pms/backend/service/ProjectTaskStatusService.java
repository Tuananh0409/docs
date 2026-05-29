package com.example.pms.backend.service;

import com.example.pms.backend.dto.task.CreateTaskStatusRequest;
import com.example.pms.backend.dto.task.DeleteTaskStatusRequest;
import com.example.pms.backend.dto.task.ReorderTaskStatusesRequest;
import com.example.pms.backend.dto.task.TaskStatusResponse;
import com.example.pms.backend.entity.Project;
import com.example.pms.backend.entity.TaskStatus;
import com.example.pms.backend.entity.User;
import com.example.pms.backend.exception.BusinessException;
import com.example.pms.backend.exception.ErrorCode;
import com.example.pms.backend.repository.TaskRepository;
import com.example.pms.backend.repository.TaskStatusRepository;
import com.example.pms.backend.security.CurrentUserProvider;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectTaskStatusService {

    private record DefaultColumn(String name, int position, String color) {}

    private static final List<DefaultColumn> DEFAULT_COLUMNS = List.of(
            new DefaultColumn("Todo", 0, "#94A3B8"),
            new DefaultColumn("In Progress", 1, "#3B82F6"),
            new DefaultColumn("Review", 2, "#8B5CF6"),
            new DefaultColumn("Done", 3, "#22C55E"));

    private final TaskStatusRepository taskStatusRepository;
    private final TaskRepository taskRepository;
    private final ProjectAccessGuard projectAccessGuard;
    private final CurrentUserProvider currentUserProvider;

    @Transactional
    public void seedDefaultColumns(Project project) {
        if (taskStatusRepository.existsByProjectId(project.getId())) {
            return;
        }
        taskStatusRepository.saveAll(DEFAULT_COLUMNS.stream()
                .map(col -> TaskStatus.builder()
                        .project(project)
                        .statusName(col.name())
                        .position(col.position())
                        .colorCode(col.color())
                        .build())
                .toList());
    }

    @Transactional(readOnly = true)
    public List<TaskStatusResponse> listByProject(Long workspaceId, Long projectId) {
        Project project = projectAccessGuard.loadProject(workspaceId, projectId);
        User currentUser = currentUserProvider.getCurrentUser();
        projectAccessGuard.requireProjectAccess(project, currentUser.getId());
        return taskStatusRepository.findByProjectIdOrderByPositionAsc(projectId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TaskStatusResponse create(
            Long workspaceId, Long projectId, CreateTaskStatusRequest request) {
        Project project = projectAccessGuard.loadProject(workspaceId, projectId);
        User currentUser = currentUserProvider.getCurrentUser();
        projectAccessGuard.requireProjectWriteAccess(project, currentUser.getId());

        String name = request.getStatusName().trim();
        if (taskStatusRepository
                .findByProjectIdAndStatusNameIgnoreCase(projectId, name)
                .isPresent()) {
            throw new BusinessException(ErrorCode.TASK_STATUS_EXISTS);
        }
        int nextPosition =
                taskStatusRepository.findByProjectIdOrderByPositionAsc(projectId).stream()
                        .mapToInt(TaskStatus::getPosition)
                        .max()
                        .orElse(-1)
                        + 1;
        String color =
                request.getColorCode() != null && !request.getColorCode().isBlank()
                        ? request.getColorCode().trim()
                        : "#94A3B8";
        TaskStatus status = taskStatusRepository.save(TaskStatus.builder()
                .project(project)
                .statusName(name)
                .position(nextPosition)
                .colorCode(color)
                .build());
        return toResponse(status);
    }

    @Transactional
    public List<TaskStatusResponse> reorder(
            Long workspaceId, Long projectId, ReorderTaskStatusesRequest request) {
        Project project = projectAccessGuard.loadProject(workspaceId, projectId);
        User currentUser = currentUserProvider.getCurrentUser();
        projectAccessGuard.requireProjectWriteAccess(project, currentUser.getId());

        List<Long> orderedIds = request.getOrderedStatusIds();
        List<TaskStatus> existing = taskStatusRepository.findByProjectIdOrderByPositionAsc(projectId);
        if (orderedIds.size() != existing.size()) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_ERROR, "Danh sách cột không khớp với dự án");
        }
        Set<Long> projectStatusIds = new HashSet<>();
        for (TaskStatus status : existing) {
            projectStatusIds.add(status.getId());
        }
        if (!projectStatusIds.equals(new HashSet<>(orderedIds))) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_ERROR, "Danh sách cột không hợp lệ");
        }

        for (int i = 0; i < orderedIds.size(); i++) {
            Long statusId = orderedIds.get(i);
            TaskStatus status = taskStatusRepository
                    .findByIdAndProjectId(statusId, projectId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TASK_STATUS_INVALID));
            status.setPosition(i);
            taskStatusRepository.save(status);
        }

        return listByProject(workspaceId, projectId);
    }

    @Transactional
    public void delete(Long workspaceId, Long projectId, Long statusId, DeleteTaskStatusRequest request) {
        Project project = projectAccessGuard.loadProject(workspaceId, projectId);
        User currentUser = currentUserProvider.getCurrentUser();
        projectAccessGuard.requireProjectWriteAccess(project, currentUser.getId());

        TaskStatus status = taskStatusRepository
                .findByIdAndProjectId(statusId, projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TASK_STATUS_INVALID));

        List<TaskStatus> columns = taskStatusRepository.findByProjectIdOrderByPositionAsc(projectId);
        if (columns.size() <= 1) {
            throw new BusinessException(ErrorCode.TASK_STATUS_LAST_COLUMN);
        }

        Long targetStatusId =
                request != null && request.getMoveToStatusId() != null
                        ? request.getMoveToStatusId()
                        : null;
        TaskStatus target;
        if (targetStatusId != null) {
            if (targetStatusId.equals(statusId)) {
                throw new BusinessException(
                        ErrorCode.VALIDATION_ERROR, "Không thể chuyển công việc sang cùng cột đang xóa");
            }
            target = taskStatusRepository
                    .findByIdAndProjectId(targetStatusId, projectId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TASK_STATUS_INVALID));
        } else {
            target = columns.stream()
                    .filter(c -> !c.getId().equals(statusId))
                    .findFirst()
                    .orElseThrow(() -> new BusinessException(ErrorCode.TASK_STATUS_INVALID));
        }

        taskRepository.reassignTasksStatus(projectId, statusId, target.getId());
        taskStatusRepository.delete(status);

        List<TaskStatus> remaining = taskStatusRepository.findByProjectIdOrderByPositionAsc(projectId);
        for (int i = 0; i < remaining.size(); i++) {
            TaskStatus col = remaining.get(i);
            if (col.getPosition() != i) {
                col.setPosition(i);
                taskStatusRepository.save(col);
            }
        }
    }

    private TaskStatusResponse toResponse(TaskStatus status) {
        return TaskStatusResponse.builder()
                .id(status.getId())
                .statusName(status.getStatusName())
                .position(status.getPosition())
                .colorCode(status.getColorCode())
                .build();
    }
}
