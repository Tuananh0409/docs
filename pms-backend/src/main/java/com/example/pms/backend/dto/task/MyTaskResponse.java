package com.example.pms.backend.dto.task;

import java.time.Instant;
import java.util.List;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class MyTaskResponse {
    Long id;
    String taskKey;
    String title;
    String priorityName;
    String priorityColorCode;
    Integer priorityWeight;
    String statusName;
    String statusColorCode;
    Instant deadline;
    boolean overdue;
    Long workspaceId;
    String workspaceName;
    String workspaceSlug;
    Long projectId;
    String projectName;
    String projectSlug;
    String projectCode;
    List<TaskAssigneeResponse> assignees;
    Instant updatedAt;
}
