package com.example.pms.backend.dto.task;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import lombok.Data;

@Data
public class UpdateTaskRequest {

    @Size(max = 500, message = "Tiêu đề tối đa 500 ký tự")
    private String title;

    @Size(max = 10000, message = "Mô tả tối đa 10000 ký tự")
    private String description;

    @Size(max = 20, message = "Độ ưu tiên tối đa 20 ký tự")
    private String priority;

    @Size(max = 50, message = "Trạng thái tối đa 50 ký tự")
    private String statusName;

    private Long milestoneId;

    /** null = không đổi; để trống chuỗi rỗng qua PATCH riêng nếu cần — dùng Optional pattern: absent vs clear */
    private LocalDate deadline;

    private Boolean clearDeadline;

    private List<Long> assigneeUserIds;
}
