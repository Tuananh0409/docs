package com.example.pms.backend.dto.task;

import java.time.Instant;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class TaskAttachmentResponse {
    Long id;
    Long taskId;
    String fileName;
    String fileType;
    Long fileSize;
    Long uploadedByUserId;
    String uploadedByUsername;
    String downloadUrl;
    Instant createdAt;
}
