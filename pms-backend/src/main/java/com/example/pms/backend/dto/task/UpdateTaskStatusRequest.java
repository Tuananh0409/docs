package com.example.pms.backend.dto.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateTaskStatusRequest {

    @NotBlank(message = "Trạng thái không được để trống")
    @Size(max = 50, message = "Trạng thái tối đa 50 ký tự")
    private String statusName;
}
