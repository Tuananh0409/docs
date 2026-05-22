package com.example.pms.backend.dto.task;

import java.time.Instant;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class TaskHistoryResponse {
    Long id;
    String fieldName;
    String oldValue;
    String newValue;
    Long changedByUserId;
    String changedByUsername;
    Instant createdAt;
}
