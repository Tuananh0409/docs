package com.example.pms.backend.dto.task;

import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Data;

@Data
public class UpdateTaskRequest {

    @Size(max = 500, message = "Tiêu đề tối đa 500 ký tự")
    private String title;

    @Size(max = 10000, message = "Mô tả tối đa 10000 ký tự")
    private String description;

    @Size(max = 50, message = "Độ ưu tiên tối đa 50 ký tự")
    private String priority;

    @Size(max = 50, message = "Độ ưu tiên tối đa 50 ký tự")
    private String priorityName;

    @Size(max = 50, message = "Trạng thái tối đa 50 ký tự")
    private String statusName;

    private Long milestoneId;

    /** null = không đổi. Chấp nhận `yyyy-MM-dd` hoặc ISO có giờ (timeline gửi cả hai). */
    private String deadline;

    private Boolean clearDeadline;

    /** null = không đổi. Chấp nhận `yyyy-MM-dd` hoặc ISO có giờ. */
    private String startDate;

    private Boolean clearStartDate;

    private List<Long> assigneeUserIds;

    private Long reporterUserId;
}
