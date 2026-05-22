package com.example.pms.backend.dto.task;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class TaskAssigneeResponse {
    Long userId;
    String username;
    String email;
}
