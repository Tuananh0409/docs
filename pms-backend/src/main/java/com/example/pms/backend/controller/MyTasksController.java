package com.example.pms.backend.controller;

import com.example.pms.backend.dto.task.MyTaskResponse;
import com.example.pms.backend.dto.task.MyTasksSummaryResponse;
import com.example.pms.backend.service.TaskService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class MyTasksController {

    private final TaskService taskService;

    @GetMapping("/mine")
    public List<MyTaskResponse> listMine() {
        return taskService.listMine();
    }

    @GetMapping("/mine/summary")
    public MyTasksSummaryResponse mineSummary() {
        return taskService.mineSummary();
    }
}
