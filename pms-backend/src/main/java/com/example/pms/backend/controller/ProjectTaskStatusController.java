package com.example.pms.backend.controller;

import com.example.pms.backend.dto.task.CreateTaskStatusRequest;
import com.example.pms.backend.dto.task.DeleteTaskStatusRequest;
import com.example.pms.backend.dto.task.ReorderTaskStatusesRequest;
import com.example.pms.backend.dto.task.TaskStatusResponse;
import com.example.pms.backend.entity.Project;
import com.example.pms.backend.service.ProjectTaskStatusService;
import com.example.pms.backend.service.ResourceResolver;
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
@RequestMapping("/api/workspaces/{workspaceSlug}/projects/{projectSlug}/task-statuses")
@RequiredArgsConstructor
public class ProjectTaskStatusController {

    private final ProjectTaskStatusService projectTaskStatusService;
    private final ResourceResolver resourceResolver;

    @GetMapping
    public List<TaskStatusResponse> list(
            @PathVariable String workspaceSlug, @PathVariable String projectSlug) {
        Project project = resourceResolver.resolveProject(workspaceSlug, projectSlug);
        return projectTaskStatusService.listByProject(
                project.getWorkspace().getId(), project.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskStatusResponse create(
            @PathVariable String workspaceSlug,
            @PathVariable String projectSlug,
            @Valid @RequestBody CreateTaskStatusRequest request) {
        Project project = resourceResolver.resolveProject(workspaceSlug, projectSlug);
        return projectTaskStatusService.create(
                project.getWorkspace().getId(), project.getId(), request);
    }

    @PatchMapping("/reorder")
    public List<TaskStatusResponse> reorder(
            @PathVariable String workspaceSlug,
            @PathVariable String projectSlug,
            @Valid @RequestBody ReorderTaskStatusesRequest request) {
        Project project = resourceResolver.resolveProject(workspaceSlug, projectSlug);
        return projectTaskStatusService.reorder(
                project.getWorkspace().getId(), project.getId(), request);
    }

    @DeleteMapping("/{statusId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable String workspaceSlug,
            @PathVariable String projectSlug,
            @PathVariable Long statusId,
            @RequestBody(required = false) DeleteTaskStatusRequest request) {
        Project project = resourceResolver.resolveProject(workspaceSlug, projectSlug);
        projectTaskStatusService.delete(
                project.getWorkspace().getId(), project.getId(), statusId, request);
    }
}
