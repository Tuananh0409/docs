package com.example.pms.backend.dto.task;

import java.time.Instant;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class TaskCommentResponse {
    Long id;
    Long userId;
    String username;
    String content;
    Instant createdAt;
}
