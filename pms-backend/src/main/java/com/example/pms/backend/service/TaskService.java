package com.example.pms.backend.service;

import com.example.pms.backend.dto.task.AssignedTasksSummaryDto;
import com.example.pms.backend.dto.task.CreateTaskCommentRequest;
import com.example.pms.backend.dto.task.CreateTaskRequest;
import com.example.pms.backend.dto.task.MyTaskResponse;
import com.example.pms.backend.dto.task.MyTasksSummaryResponse;
import com.example.pms.backend.dto.task.TaskAssigneeResponse;
import com.example.pms.backend.dto.task.TaskCommentResponse;
import com.example.pms.backend.dto.task.TaskHistoryResponse;
import com.example.pms.backend.dto.task.TaskResponse;
import com.example.pms.backend.dto.task.TaskSummaryResponse;
import com.example.pms.backend.dto.task.UpdateTaskRequest;
import com.example.pms.backend.entity.Milestone;
import com.example.pms.backend.entity.Project;
import com.example.pms.backend.entity.Task;
import com.example.pms.backend.entity.TaskAssignee;
import com.example.pms.backend.entity.TaskComment;
import com.example.pms.backend.entity.TaskHistory;
import com.example.pms.backend.entity.TaskPriority;
import com.example.pms.backend.entity.TaskStatus;
import com.example.pms.backend.entity.User;
import com.example.pms.backend.exception.BusinessException;
import com.example.pms.backend.exception.ErrorCode;
import com.example.pms.backend.repository.MilestoneRepository;
import com.example.pms.backend.repository.ProjectMemberRepository;
import com.example.pms.backend.repository.TaskAssigneeRepository;
import com.example.pms.backend.repository.TaskCommentRepository;
import com.example.pms.backend.repository.TaskHistoryRepository;
import com.example.pms.backend.repository.TaskRepository;
import com.example.pms.backend.repository.TaskStatusRepository;
import com.example.pms.backend.repository.UserRepository;
import com.example.pms.backend.repository.WorkspaceMemberRepository;
import com.example.pms.backend.security.CurrentUserProvider;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TaskService {

    private static final String DEFAULT_STATUS = "Todo";
    private static final String DEFAULT_PRIORITY = "Medium";
    private static final String STATUS_DONE = "Done";

    private final TaskRepository taskRepository;
    private final TaskAssigneeRepository taskAssigneeRepository;
    private final TaskStatusRepository taskStatusRepository;
    private final TaskCommentRepository taskCommentRepository;
    private final TaskHistoryRepository taskHistoryRepository;
    private final MilestoneRepository milestoneRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final ProjectAccessGuard projectAccessGuard;
    private final LookupCacheService lookupCacheService;
    private final CurrentUserProvider currentUserProvider;

    @Transactional(readOnly = true)
    public List<TaskSummaryResponse> listByProject(Long workspaceId, Long projectId) {
        Project project = projectAccessGuard.loadProject(workspaceId, projectId);
        User currentUser = currentUserProvider.getCurrentUser();
        projectAccessGuard.requireProjectAccess(project, currentUser.getId());

        List<Task> tasks = taskRepository.findByProjectIdWithDetails(projectId);
        Map<Long, List<TaskAssigneeResponse>> assigneesByTaskId =
                loadAssigneesByTaskIds(taskIdsOf(tasks));

        return tasks.stream()
                .map(t -> toSummary(t, project, assigneesByTaskId.getOrDefault(t.getId(), List.of())))
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getById(Long workspaceId, Long projectId, Long taskId) {
        Project project = projectAccessGuard.loadProject(workspaceId, projectId);
        User currentUser = currentUserProvider.getCurrentUser();
        projectAccessGuard.requireProjectAccess(project, currentUser.getId());

        Task task = loadTask(projectId, taskId);
        List<TaskAssigneeResponse> assignees =
                loadAssigneesByTaskIds(List.of(task.getId())).getOrDefault(task.getId(), List.of());
        return toDetail(task, project, assignees);
    }

    @Transactional
    public TaskResponse create(Long workspaceId, Long projectId, CreateTaskRequest request) {
        Project project = projectAccessGuard.loadProject(workspaceId, projectId);
        User currentUser = currentUserProvider.getCurrentUser();
        projectAccessGuard.requireProjectWriteAccess(project, currentUser.getId());

        TaskStatus status = resolveStatus(projectId, request.getStatusName());
        Milestone milestone = resolveMilestone(projectId, request.getMilestoneId());
        Instant startDate = toInstantStart(request.getStartDate());
        Instant deadline = toInstantEnd(request.getDeadline());
        validateTaskDates(project, startDate, deadline);

        User reporter = resolveReporter(project, request.getReporterUserId(), currentUser);

        Task task = Task.builder()
                .project(project)
                .milestone(milestone)
                .title(request.getTitle().trim())
                .description(trimToNull(request.getDescription()))
                .priority(resolvePriority(priorityInput(request.getPriorityName(), request.getPriority())))
                .status(status)
                .startDate(startDate)
                .deadline(deadline)
                .createdBy(currentUser)
                .reporter(reporter)
                .deleted(false)
                .build();

        task = taskRepository.save(task);
        List<TaskAssigneeResponse> assignees = syncAssignees(project, task, request.getAssigneeUserIds(), currentUser);
        recordHistory(task, currentUser, "created", null, task.getTitle());

        return toDetail(task, project, resolveAssigneesAfterSave(task, assignees));
    }

    @Transactional
    public TaskResponse update(Long workspaceId, Long projectId, Long taskId, UpdateTaskRequest request) {
        Project project = projectAccessGuard.loadProject(workspaceId, projectId);
        User currentUser = currentUserProvider.getCurrentUser();
        projectAccessGuard.requireProjectWriteAccess(project, currentUser.getId());

        Task task = loadTask(projectId, taskId);

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            String newTitle = request.getTitle().trim();
            if (!newTitle.equals(task.getTitle())) {
                recordHistory(task, currentUser, "title", task.getTitle(), newTitle);
                task.setTitle(newTitle);
            }
        }
        if (request.getDescription() != null) {
            String newDesc = trimToNull(request.getDescription());
            if (!Objects.equals(newDesc, task.getDescription())) {
                recordHistory(task, currentUser, "description", task.getDescription(), newDesc);
                task.setDescription(newDesc);
            }
        }
        String priorityInput = priorityInput(request.getPriorityName(), request.getPriority());
        if (priorityInput != null && !priorityInput.isBlank()) {
            TaskPriority newPriority = resolvePriority(priorityInput);
            String oldName = task.getPriority() != null ? task.getPriority().getName() : null;
            if (!newPriority.getName().equalsIgnoreCase(oldName != null ? oldName : "")) {
                recordHistory(task, currentUser, "priority", oldName, newPriority.getName());
                task.setPriority(newPriority);
            }
        }
        if (request.getStatusName() != null && !request.getStatusName().isBlank()) {
            TaskStatus newStatus = resolveStatus(projectId, request.getStatusName());
            String oldName = task.getStatus() != null ? task.getStatus().getStatusName() : null;
            if (!newStatus.getStatusName().equalsIgnoreCase(oldName != null ? oldName : "")) {
                recordHistory(task, currentUser, "status", oldName, newStatus.getStatusName());
                task.setStatus(newStatus);
            }
        }
        if (request.getMilestoneId() != null) {
            Milestone milestone = resolveMilestone(projectId, request.getMilestoneId());
            Long oldId = task.getMilestone() != null ? task.getMilestone().getId() : null;
            if (!milestone.getId().equals(oldId)) {
                recordHistory(
                        task,
                        currentUser,
                        "milestone",
                        oldId != null ? String.valueOf(oldId) : null,
                        String.valueOf(milestone.getId()));
                task.setMilestone(milestone);
            }
        }
        if (Boolean.TRUE.equals(request.getClearStartDate())) {
            if (task.getStartDate() != null) {
                recordHistory(
                        task,
                        currentUser,
                        "startDate",
                        task.getStartDate().toString(),
                        null);
                task.setStartDate(null);
            }
        } else if (parseRequestDate(request.getStartDate()) != null) {
            Instant newStart = toInstantStart(parseRequestDate(request.getStartDate()));
            validateTaskDates(project, newStart, task.getDeadline());
            if (!Objects.equals(newStart, task.getStartDate())) {
                recordHistory(
                        task,
                        currentUser,
                        "startDate",
                        task.getStartDate() != null ? task.getStartDate().toString() : null,
                        newStart.toString());
                task.setStartDate(newStart);
            }
        }
        if (Boolean.TRUE.equals(request.getClearDeadline())) {
            if (task.getDeadline() != null) {
                recordHistory(task, currentUser, "deadline", String.valueOf(task.getDeadline()), null);
                task.setDeadline(null);
            }
        } else if (parseRequestDate(request.getDeadline()) != null) {
            Instant newDeadline = toInstantEnd(parseRequestDate(request.getDeadline()));
            validateTaskDates(project, task.getStartDate(), newDeadline);
            if (!Objects.equals(newDeadline, task.getDeadline())) {
                recordHistory(
                        task,
                        currentUser,
                        "deadline",
                        task.getDeadline() != null ? task.getDeadline().toString() : null,
                        newDeadline.toString());
                task.setDeadline(newDeadline);
            }
        }
        validateTaskDates(project, task.getStartDate(), task.getDeadline());
        List<TaskAssigneeResponse> assignees = syncAssignees(project, task, request.getAssigneeUserIds(), currentUser);
        if (request.getReporterUserId() != null) {
            User newReporter = resolveReporter(project, request.getReporterUserId(), currentUser);
            if (!newReporter.getId().equals(task.getReporter().getId())) {
                recordHistory(
                        task,
                        currentUser,
                        "reporter",
                        task.getReporter().getUsername(),
                        newReporter.getUsername());
                task.setReporter(newReporter);
            }
        }

        task = taskRepository.save(task);
        return toDetail(task, project, resolveAssigneesAfterSave(task, assignees));
    }

    @Transactional
    public TaskResponse updateStatus(
            Long workspaceId, Long projectId, Long taskId, String statusName) {
        UpdateTaskRequest patch = new UpdateTaskRequest();
        patch.setStatusName(statusName);
        return update(workspaceId, projectId, taskId, patch);
    }

    @Transactional
    public void delete(Long workspaceId, Long projectId, Long taskId) {
        Project project = projectAccessGuard.loadProject(workspaceId, projectId);
        User currentUser = currentUserProvider.getCurrentUser();
        if (!projectAccessGuard.canManageProject(project, currentUser)) {
            projectAccessGuard.requireProjectWriteAccess(project, currentUser.getId());
        }

        Task task = loadTask(projectId, taskId);
        task.setDeleted(true);
        taskRepository.save(task);
        recordHistory(task, currentUser, "deleted", "false", "true");
    }

    @Transactional(readOnly = true)
    public List<MyTaskResponse> listMine() {
        User currentUser = currentUserProvider.getCurrentUser();
        List<Task> tasks = listAccessibleAssignedTasks(currentUser.getId());
        Map<Long, List<TaskAssigneeResponse>> assigneesByTaskId =
                loadAssigneesByTaskIds(taskIdsOf(tasks));

        return tasks.stream()
                .map(t -> toMyTask(t, assigneesByTaskId.getOrDefault(t.getId(), List.of())))
                .toList();
    }

    @Transactional(readOnly = true)
    public MyTasksSummaryResponse mineSummary() {
        User currentUser = currentUserProvider.getCurrentUser();
        AssignedTasksSummaryDto summary =
                taskRepository.summarizeAccessibleAssignedTasks(currentUser.getId(), Instant.now());

        return MyTasksSummaryResponse.builder()
                .totalAssigned(summary.total())
                .overdue(summary.overdue())
                .inProgress(summary.inProgress())
                .done(summary.done())
                .build();
    }

    @Transactional(readOnly = true)
    public List<TaskCommentResponse> listComments(Long workspaceId, Long projectId, Long taskId) {
        Project project = projectAccessGuard.loadProject(workspaceId, projectId);
        User currentUser = currentUserProvider.getCurrentUser();
        projectAccessGuard.requireProjectAccess(project, currentUser.getId());
        loadTask(projectId, taskId);

        return taskCommentRepository.findByTaskIdWithUser(taskId).stream()
                .map(this::toCommentResponse)
                .toList();
    }

    @Transactional
    public TaskCommentResponse addComment(
            Long workspaceId, Long projectId, Long taskId, CreateTaskCommentRequest request) {
        Project project = projectAccessGuard.loadProject(workspaceId, projectId);
        User currentUser = currentUserProvider.getCurrentUser();
        projectAccessGuard.requireProjectAccess(project, currentUser.getId());

        Task task = loadTask(projectId, taskId);
        TaskComment comment = TaskComment.builder()
                .task(task)
                .user(currentUser)
                .content(request.getContent().trim())
                .build();
        comment = taskCommentRepository.save(comment);
        recordHistory(task, currentUser, "comment", null, "added");
        return toCommentResponse(comment);
    }

    @Transactional
    public void deleteComment(Long workspaceId, Long projectId, Long taskId, Long commentId) {
        Project project = projectAccessGuard.loadProject(workspaceId, projectId);
        User currentUser = currentUserProvider.getCurrentUser();
        projectAccessGuard.requireProjectAccess(project, currentUser.getId());

        TaskComment comment = taskCommentRepository
                .findByIdAndTaskId(commentId, taskId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TASK_COMMENT_NOT_FOUND));

        boolean own = comment.getUser().getId().equals(currentUser.getId());
        boolean manager = projectAccessGuard.canManageProject(project, currentUser);
        if (!own && !manager) {
            throw new BusinessException(ErrorCode.TASK_FORBIDDEN);
        }

        taskCommentRepository.delete(comment);
    }

    @Transactional(readOnly = true)
    public List<TaskHistoryResponse> listHistory(Long workspaceId, Long projectId, Long taskId) {
        Project project = projectAccessGuard.loadProject(workspaceId, projectId);
        User currentUser = currentUserProvider.getCurrentUser();
        projectAccessGuard.requireProjectAccess(project, currentUser.getId());
        loadTask(projectId, taskId);

        return taskHistoryRepository.findByTaskIdWithUser(taskId).stream()
                .map(this::toHistoryResponse)
                .toList();
    }

    private Task loadTask(Long projectId, Long taskId) {
        return taskRepository
                .findByIdAndProjectIdWithDetails(taskId, projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TASK_NOT_FOUND));
    }

    private List<Task> listAccessibleAssignedTasks(Long userId) {
        return taskRepository.findAccessibleAssignedToUser(userId);
    }

    private List<TaskAssigneeResponse> resolveAssigneesAfterSave(
            Task task, List<TaskAssigneeResponse> synced) {
        if (synced != null) {
            return synced;
        }
        return loadAssigneesByTaskIds(List.of(task.getId())).getOrDefault(task.getId(), List.of());
    }

    private User resolveReporter(Project project, Long reporterUserId, User fallback) {
        if (reporterUserId == null) {
            return fallback;
        }
        User reporter = userRepository
                .findById(reporterUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        ensureProjectMemberOrAdmin(project, reporter.getId());
        return reporter;
    }

    private List<TaskAssigneeResponse> syncAssignees(
            Project project, Task task, List<Long> assigneeUserIds, User actor) {
        if (assigneeUserIds == null) {
            return null;
        }
        Set<Long> target = new HashSet<>(assigneeUserIds);
        Set<Long> current = task.getId() == null
                ? Set.of()
                : taskAssigneeRepository.findUserIdsByTaskId(task.getId());
        if (current.equals(target)) {
            if (target.isEmpty()) {
                return List.of();
            }
            return loadAssigneesByTaskIds(List.of(task.getId())).getOrDefault(task.getId(), List.of());
        }

        Set<Long> memberUserIds = projectMemberRepository.findUserIdsByProjectId(project.getId());
        Set<Long> adminUserIds =
                workspaceMemberRepository.findAdminUserIdsByWorkspaceId(project.getWorkspace().getId());

        Map<Long, User> usersById = target.isEmpty()
                ? Map.of()
                : userRepository.findAllById(target).stream()
                        .collect(Collectors.toMap(User::getId, u -> u));
        if (usersById.size() != target.size()) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        if (task.getId() != null) {
            taskAssigneeRepository.deleteByTaskId(task.getId());
            // Flush deletes before re-insert; otherwise uq_task_assignees_task_user fires
            // when keeping an existing assignee and adding another.
            taskAssigneeRepository.flush();
        }

        for (Long userId : target) {
            if (!memberUserIds.contains(userId) && !adminUserIds.contains(userId)) {
                throw new BusinessException(
                        ErrorCode.PROJECT_FORBIDDEN, "Chỉ gán được thành viên trong dự án");
            }
            taskAssigneeRepository.save(TaskAssignee.builder()
                    .task(task)
                    .user(usersById.get(userId))
                    .build());
        }
        recordHistory(
                task,
                actor,
                "assignees",
                formatAssigneeIds(current),
                formatAssigneeIds(target));
        return target.stream()
                .sorted()
                .map(id -> toAssigneeResponse(usersById.get(id)))
                .toList();
    }

    private static String formatAssigneeIds(Set<Long> ids) {
        if (ids.isEmpty()) {
            return "none";
        }
        return ids.stream().sorted().map(String::valueOf).collect(Collectors.joining(", "));
    }

    private void ensureProjectMemberOrAdmin(Project project, Long userId) {
        if (projectAccessGuard.isWorkspaceAdmin(project.getWorkspace().getId(), userId)) {
            return;
        }
        if (projectMemberRepository.findByProjectIdAndUserId(project.getId(), userId).isEmpty()) {
            throw new BusinessException(
                    ErrorCode.PROJECT_FORBIDDEN, "Chỉ gán được thành viên trong dự án");
        }
    }

    private Milestone resolveMilestone(Long projectId, Long milestoneId) {
        if (milestoneId == null) {
            return null;
        }
        return milestoneRepository
                .findByIdAndProjectIdAndDeletedFalse(milestoneId, projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MILESTONE_NOT_FOUND));
    }

    private TaskStatus resolveStatus(Long projectId, String statusName) {
        String name = statusName == null || statusName.isBlank() ? DEFAULT_STATUS : statusName.trim();
        return taskStatusRepository
                .findByProjectIdAndStatusNameIgnoreCase(projectId, name)
                .orElseThrow(() -> new BusinessException(ErrorCode.TASK_STATUS_INVALID));
    }

    private String priorityInput(String priorityName, String priority) {
        if (priorityName != null && !priorityName.isBlank()) {
            return priorityName;
        }
        return priority;
    }

    private TaskPriority resolvePriority(String priorityName) {
        return lookupCacheService.requireTaskPriority(priorityName, DEFAULT_PRIORITY);
    }

    private void validateTaskDates(Project project, Instant startDate, Instant deadline) {
        if (startDate != null && deadline != null && startDate.isAfter(deadline)) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_ERROR, "Ngày bắt đầu không được sau hạn chót");
        }
        if (startDate != null
                && project.getStartDate() != null
                && startDate.isBefore(project.getStartDate())) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_ERROR,
                    "Ngày bắt đầu task không được trước ngày bắt đầu dự án");
        }
        if (deadline == null) {
            return;
        }
        if (project.getEndDate() != null && deadline.isAfter(project.getEndDate())) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_ERROR, "Deadline task không được sau ngày kết thúc dự án");
        }
    }

    /** Parse `yyyy-MM-dd` hoặc ISO datetime (lấy 10 ký tự đầu). */
    private LocalDate parseRequestDate(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String part = raw.trim();
        if (part.length() >= 10) {
            part = part.substring(0, 10);
        }
        return LocalDate.parse(part);
    }

    private Instant toInstantStart(LocalDate date) {
        return date == null ? null : date.atStartOfDay().toInstant(ZoneOffset.UTC);
    }

    private Instant toInstantEnd(LocalDate date) {
        return date == null ? null : date.atTime(23, 59, 59).toInstant(ZoneOffset.UTC);
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private void recordHistory(Task task, User user, String field, String oldVal, String newVal) {
        taskHistoryRepository.save(TaskHistory.builder()
                .task(task)
                .changedBy(user)
                .fieldName(field)
                .oldValue(oldVal)
                .newValue(newVal)
                .build());
    }

    private String taskKey(Project project, Task task) {
        return project.getCode() + "-" + task.getId();
    }

    private boolean isOverdue(Task task) {
        if (task.getDeadline() == null) {
            return false;
        }
        if (task.getStatus() != null
                && STATUS_DONE.equalsIgnoreCase(task.getStatus().getStatusName())) {
            return false;
        }
        return task.getDeadline().isBefore(Instant.now());
    }

    private static List<Long> taskIdsOf(List<Task> tasks) {
        return tasks.stream().map(Task::getId).toList();
    }

    private Map<Long, List<TaskAssigneeResponse>> loadAssigneesByTaskIds(List<Long> taskIds) {
        if (taskIds.isEmpty()) {
            return Map.of();
        }
        Map<Long, List<TaskAssigneeResponse>> grouped = new HashMap<>();
        for (TaskAssignee assignee : taskAssigneeRepository.findByTaskIdInWithUser(taskIds)) {
            grouped.computeIfAbsent(assignee.getTask().getId(), k -> new ArrayList<>())
                    .add(toAssigneeResponse(assignee));
        }
        return grouped;
    }

    private TaskAssigneeResponse toAssigneeResponse(TaskAssignee assignee) {
        return toAssigneeResponse(assignee.getUser());
    }

    private TaskAssigneeResponse toAssigneeResponse(User user) {
        return TaskAssigneeResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    private TaskSummaryResponse toSummary(
            Task task, Project project, List<TaskAssigneeResponse> assignees) {
        return TaskSummaryResponse.builder()
                .id(task.getId())
                .taskKey(taskKey(project, task))
                .title(task.getTitle())
                .priorityName(task.getPriority().getName())
                .priorityColorCode(task.getPriority().getColorCode())
                .priorityWeight(task.getPriority().getWeight())
                .statusId(task.getStatus() != null ? task.getStatus().getId() : null)
                .statusName(task.getStatus() != null ? task.getStatus().getStatusName() : null)
                .statusColorCode(task.getStatus() != null ? task.getStatus().getColorCode() : null)
                .deadline(task.getDeadline())
                .startDate(task.getStartDate())
                .overdue(isOverdue(task))
                .milestoneId(task.getMilestone() != null ? task.getMilestone().getId() : null)
                .milestoneName(task.getMilestone() != null ? task.getMilestone().getName() : null)
                .createdByUserId(task.getCreatedBy().getId())
                .createdByUsername(task.getCreatedBy().getUsername())
                .reporterUserId(task.getReporter().getId())
                .reporterUsername(task.getReporter().getUsername())
                .assignees(assignees)
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    private TaskResponse toDetail(Task task, Project project, List<TaskAssigneeResponse> assignees) {
        return TaskResponse.builder()
                .id(task.getId())
                .projectId(project.getId())
                .projectCode(project.getCode())
                .taskKey(taskKey(project, task))
                .title(task.getTitle())
                .description(task.getDescription())
                .priorityName(task.getPriority().getName())
                .priorityColorCode(task.getPriority().getColorCode())
                .priorityWeight(task.getPriority().getWeight())
                .statusId(task.getStatus() != null ? task.getStatus().getId() : null)
                .statusName(task.getStatus() != null ? task.getStatus().getStatusName() : null)
                .statusColorCode(task.getStatus() != null ? task.getStatus().getColorCode() : null)
                .deadline(task.getDeadline())
                .startDate(task.getStartDate())
                .overdue(isOverdue(task))
                .milestoneId(task.getMilestone() != null ? task.getMilestone().getId() : null)
                .milestoneName(task.getMilestone() != null ? task.getMilestone().getName() : null)
                .createdByUserId(task.getCreatedBy().getId())
                .createdByUsername(task.getCreatedBy().getUsername())
                .reporterUserId(task.getReporter().getId())
                .reporterUsername(task.getReporter().getUsername())
                .assignees(assignees)
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    private MyTaskResponse toMyTask(Task task, List<TaskAssigneeResponse> assignees) {
        Project project = task.getProject();
        return MyTaskResponse.builder()
                .id(task.getId())
                .taskKey(taskKey(project, task))
                .title(task.getTitle())
                .priorityName(task.getPriority().getName())
                .priorityColorCode(task.getPriority().getColorCode())
                .priorityWeight(task.getPriority().getWeight())
                .statusName(task.getStatus() != null ? task.getStatus().getStatusName() : null)
                .statusColorCode(task.getStatus() != null ? task.getStatus().getColorCode() : null)
                .deadline(task.getDeadline())
                .overdue(isOverdue(task))
                .workspaceId(project.getWorkspace().getId())
                .workspaceName(project.getWorkspace().getName())
                .workspaceSlug(project.getWorkspace().getSlug())
                .projectId(project.getId())
                .projectName(project.getName())
                .projectSlug(project.getSlug())
                .projectCode(project.getCode())
                .assignees(assignees)
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    private TaskCommentResponse toCommentResponse(TaskComment comment) {
        return TaskCommentResponse.builder()
                .id(comment.getId())
                .userId(comment.getUser().getId())
                .username(comment.getUser().getUsername())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    private TaskHistoryResponse toHistoryResponse(TaskHistory history) {
        return TaskHistoryResponse.builder()
                .id(history.getId())
                .fieldName(history.getFieldName())
                .oldValue(history.getOldValue())
                .newValue(history.getNewValue())
                .changedByUserId(history.getChangedBy().getId())
                .changedByUsername(history.getChangedBy().getUsername())
                .createdAt(history.getCreatedAt())
                .build();
    }
}
