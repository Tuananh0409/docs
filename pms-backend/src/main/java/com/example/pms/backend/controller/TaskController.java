package com.example.pms.backend.controller;

import com.example.pms.backend.dto.task.CreateTaskCommentRequest;
import com.example.pms.backend.dto.task.CreateTaskRequest;
import com.example.pms.backend.dto.task.TaskCommentResponse;
import com.example.pms.backend.dto.task.TaskHistoryResponse;
import com.example.pms.backend.dto.task.TaskResponse;
import com.example.pms.backend.dto.task.TaskSummaryResponse;
import com.example.pms.backend.dto.task.UpdateTaskRequest;
import com.example.pms.backend.dto.task.UpdateTaskStatusRequest;
import com.example.pms.backend.entity.Project;
import com.example.pms.backend.service.ResourceResolver;
import com.example.pms.backend.service.TaskService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/workspaces/{workspaceSlug}/projects/{projectSlug}/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final ResourceResolver resourceResolver;

    @GetMapping
    public List<TaskSummaryResponse> list(
            @PathVariable String workspaceSlug, @PathVariable String projectSlug) {
        Project project = resourceResolver.resolveProject(workspaceSlug, projectSlug);
        return taskService.listByProject(project.getWorkspace().getId(), project.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse create(
            @PathVariable String workspaceSlug,
            @PathVariable String projectSlug,
            @Valid @RequestBody CreateTaskRequest request) {
        Project project = resourceResolver.resolveProject(workspaceSlug, projectSlug);
        return taskService.create(project.getWorkspace().getId(), project.getId(), request);
    }

    @GetMapping("/{taskId}")
    public TaskResponse get(
            @PathVariable String workspaceSlug,
            @PathVariable String projectSlug,
            @PathVariable Long taskId) {
        Project project = resourceResolver.resolveProject(workspaceSlug, projectSlug);
        return taskService.getById(project.getWorkspace().getId(), project.getId(), taskId);
    }

    @PatchMapping("/{taskId}")
    public TaskResponse update(
            @PathVariable String workspaceSlug,
            @PathVariable String projectSlug,
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskRequest request) {
        Project project = resourceResolver.resolveProject(workspaceSlug, projectSlug);
        return taskService.update(project.getWorkspace().getId(), project.getId(), taskId, request);
    }

    @PatchMapping("/{taskId}/status")
    public TaskResponse updateStatus(
            @PathVariable String workspaceSlug,
            @PathVariable String projectSlug,
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskStatusRequest request) {
        Project project = resourceResolver.resolveProject(workspaceSlug, projectSlug);
        return taskService.updateStatus(
                project.getWorkspace().getId(), project.getId(), taskId, request.getStatusName());
    }

    @DeleteMapping("/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable String workspaceSlug,
            @PathVariable String projectSlug,
            @PathVariable Long taskId) {
        Project project = resourceResolver.resolveProject(workspaceSlug, projectSlug);
        taskService.delete(project.getWorkspace().getId(), project.getId(), taskId);
    }

    @GetMapping("/{taskId}/comments")
    public List<TaskCommentResponse> listComments(
            @PathVariable String workspaceSlug,
            @PathVariable String projectSlug,
            @PathVariable Long taskId) {
        Project project = resourceResolver.resolveProject(workspaceSlug, projectSlug);
        return taskService.listComments(project.getWorkspace().getId(), project.getId(), taskId);
    }

    @PostMapping("/{taskId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskCommentResponse addComment(
            @PathVariable String workspaceSlug,
            @PathVariable String projectSlug,
            @PathVariable Long taskId,
            @Valid @RequestBody CreateTaskCommentRequest request) {
        Project project = resourceResolver.resolveProject(workspaceSlug, projectSlug);
        return taskService.addComment(project.getWorkspace().getId(), project.getId(), taskId, request);
    }

    @DeleteMapping("/{taskId}/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(
            @PathVariable String workspaceSlug,
            @PathVariable String projectSlug,
            @PathVariable Long taskId,
            @PathVariable Long commentId) {
        Project project = resourceResolver.resolveProject(workspaceSlug, projectSlug);
        taskService.deleteComment(project.getWorkspace().getId(), project.getId(), taskId, commentId);
    }

    @GetMapping("/{taskId}/history")
    public List<TaskHistoryResponse> listHistory(
            @PathVariable String workspaceSlug,
            @PathVariable String projectSlug,
            @PathVariable Long taskId) {
        Project project = resourceResolver.resolveProject(workspaceSlug, projectSlug);
        return taskService.listHistory(project.getWorkspace().getId(), project.getId(), taskId);
    }
}
