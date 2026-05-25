package com.example.pms.backend.dto.task;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DeleteTaskStatusRequest {

    /** Cột đích để chuyển công việc trước khi xóa cột này. */
    private Long moveToStatusId;
}
