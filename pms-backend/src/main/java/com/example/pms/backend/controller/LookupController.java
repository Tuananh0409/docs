package com.example.pms.backend.controller;

import com.example.pms.backend.dto.lookup.ProjectPriorityResponse;
import com.example.pms.backend.repository.ProjectPriorityRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lookups")
@RequiredArgsConstructor
public class LookupController {

    private final ProjectPriorityRepository projectPriorityRepository;

    @GetMapping("/project-priorities")
    public List<ProjectPriorityResponse> listProjectPriorities() {
        return projectPriorityRepository.findAllByOrderByWeightDesc().stream()
                .map(p -> ProjectPriorityResponse.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .weight(p.getWeight())
                        .colorCode(p.getColorCode())
                        .build())
                .toList();
    }
}
