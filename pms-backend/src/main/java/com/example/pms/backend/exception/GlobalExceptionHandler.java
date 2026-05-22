package com.example.pms.backend.exception;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiErrorResponse> handleBusiness(BusinessException ex) {
        ErrorCode code = ex.getErrorCode();
        return ResponseEntity.status(code.getStatus())
                .body(ApiErrorResponse.builder()
                        .code(code.getCode())
                        .message(ex.getMessage())
                        .timestamp(Instant.now())
                        .build());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest()
                .body(ApiErrorResponse.builder()
                        .code(ErrorCode.VALIDATION_ERROR.getCode())
                        .message("Dữ liệu JSON không hợp lệ")
                        .timestamp(Instant.now())
                        .build());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        error -> error.getField(),
                        error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : "invalid",
                        (a, b) -> a));
        return ResponseEntity.badRequest()
                .body(ApiErrorResponse.builder()
                        .code(ErrorCode.VALIDATION_ERROR.getCode())
                        .message(ErrorCode.VALIDATION_ERROR.getDefaultMessage())
                        .timestamp(Instant.now())
                        .fieldErrors(fieldErrors)
                        .build());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex) {
        String message = "Dữ liệu trùng với bản ghi khác";
        String raw = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : "";
        if (raw != null) {
            if (raw.contains("uq_task_assignees_task_user")) {
                message = "Người này đã được gán cho công việc";
            } else if (raw.contains("uq_task_status_name")
                    || raw.contains("uq_task_status_project_name")) {
                message = "Tên cột trạng thái đã tồn tại trong dự án này";
            } else if (raw.contains("uq_workspaces_code")) {
                message = "Mã phòng ban đã tồn tại — hệ thống sẽ tự gợi ý mã khác khi bạn tạo lại";
            } else if (raw.contains("uq_workspaces_slug")) {
                message = "Slug URL phòng ban đã tồn tại";
            } else if (raw.contains("uq_workspaces_name")) {
                message = "Tên phòng ban đã tồn tại";
            }
        }
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiErrorResponse.builder()
                        .code(ErrorCode.WORKSPACE_NAME_EXISTS.getCode())
                        .message(message)
                        .timestamp(Instant.now())
                        .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception ex) {
        log.error("Unhandled error", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiErrorResponse.builder()
                        .code("ERR_INTERNAL")
                        .message("Lỗi hệ thống. Kiểm tra backend log và PostgreSQL đang chạy.")
                        .timestamp(Instant.now())
                        .build());
    }
}
