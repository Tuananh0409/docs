package com.example.pms.backend.dto.task;

public record AssignedTasksSummaryDto(long total, long overdue, long inProgress, long done) {}
