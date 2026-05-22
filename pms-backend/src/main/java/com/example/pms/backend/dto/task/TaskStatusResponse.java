package com.example.pms.backend.dto.task;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class TaskStatusResponse {
    Long id;
    String statusName;
    Integer position;
    String colorCode;
}
