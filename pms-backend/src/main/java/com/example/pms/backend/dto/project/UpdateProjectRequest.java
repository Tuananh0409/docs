package com.example.pms.backend.dto.project;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Data;

@Data
public class UpdateProjectRequest {

    @Size(max = 255, message = "Tên dự án tối đa 255 ký tự")
    private String name;

    @Size(max = 2000, message = "Mô tả tối đa 2000 ký tự")
    private String description;

    private LocalDate startDate;

    private LocalDate endDate;

    @Size(max = 20, message = "Mã màu tối đa 20 ký tự")
    private String colorCode;

    @Size(max = 20, message = "privacyMode tối đa 20 ký tự")
    private String privacyMode;

    @Size(max = 50, message = "Trạng thái tối đa 50 ký tự")
    private String statusName;

    @Size(max = 50, message = "Độ ưu tiên tối đa 50 ký tự")
    private String priorityName;

    private Long projectLeadUserId;
}
