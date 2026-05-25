package com.example.pms.backend.dto.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateTaskStatusRequest {

    @NotBlank(message = "Tên cột không được để trống")
    @Size(max = 50, message = "Tên cột tối đa 50 ký tự")
    private String statusName;

    @Size(max = 20, message = "Mã màu không hợp lệ")
    private String colorCode;
}
