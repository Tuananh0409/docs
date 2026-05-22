package com.example.pms.backend.dto.task;

import java.time.Instant;
import java.util.List;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class TaskSummaryResponse {
    Long id;
    String taskKey;
    String title;
    String priorityName;
    String priorityColorCode;
    Integer priorityWeight;
    Long statusId;
    String statusName;
    String statusColorCode;
    Instant deadline;
    boolean overdue;
    Long milestoneId;
    String milestoneName;
    Long createdByUserId;
    String createdByUsername;
    List<TaskAssigneeResponse> assignees;
    Instant createdAt;
    Instant updatedAt;
}
