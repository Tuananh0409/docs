package com.example.pms.backend.controller;

import com.example.pms.backend.dto.task.TaskStatusResponse;
import com.example.pms.backend.service.TaskService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/task-statuses")
@RequiredArgsConstructor
public class TaskStatusController {

    private final TaskService taskService;

    @GetMapping
    public List<TaskStatusResponse> list() {
        return taskService.listStatuses();
    }
}
