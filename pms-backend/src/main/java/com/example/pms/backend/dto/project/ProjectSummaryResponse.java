package com.example.pms.backend.dto.project;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ProjectSummaryResponse {

    Long id;
    String name;
    String code;
    String slug;
    String colorCode;
    String statusName;
    String priorityName;
    String priorityColorCode;
    Integer priorityWeight;
    String myRole;
    Long workspaceId;
}
