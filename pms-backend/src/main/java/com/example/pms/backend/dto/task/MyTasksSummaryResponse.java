package com.example.pms.backend.dto.task;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class MyTasksSummaryResponse {
    long totalAssigned;
    long overdue;
    long inProgress;
    long done;
}
