package com.example.pms.backend.dto.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateTaskCommentRequest {

    @NotBlank(message = "Nội dung bình luận không được để trống")
    @Size(max = 5000, message = "Bình luận tối đa 5000 ký tự")
    private String content;
}
