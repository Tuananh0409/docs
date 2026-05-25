package com.example.pms.backend.dto.task;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReorderTaskStatusesRequest {

    @NotEmpty(message = "Danh sách cột không được trống")
    private List<Long> orderedStatusIds;
}
