package com.example.pms.backend.dto.task;

import java.time.Instant;
import java.util.List;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class TaskResponse {
    Long id;
    Long projectId;
    String projectCode;
    String taskKey;
    String title;
    String description;
    String priorityName;
    String priorityColorCode;
    Integer priorityWeight;
    Long statusId;
    String statusName;
    String statusColorCode;
    Instant deadline;
    Instant startDate;
    boolean overdue;
    Long milestoneId;
    String milestoneName;
    Long createdByUserId;
    String createdByUsername;
    Long reporterUserId;
    String reporterUsername;
    List<TaskAssigneeResponse> assignees;
    Instant createdAt;
    Instant updatedAt;
}
