package com.example.pms.backend.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    WORKSPACE_NAME_EXISTS("ERR_WS_01", "Tên Workspace đã tồn tại", HttpStatus.CONFLICT),
    WORKSPACE_NOT_FOUND("ERR_WS_03", "Workspace không tồn tại", HttpStatus.NOT_FOUND),
    WORKSPACE_FORBIDDEN("ERR_WS_04", "Bạn không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN),
    WORKSPACE_DELETE_NAME_MISMATCH("ERR_WS_05", "Tên xác nhận không khớp", HttpStatus.BAD_REQUEST),
    WORKSPACE_HAS_ACTIVE_PROJECTS("ERR_WS_06", "Vẫn còn dự án đang hoạt động, không thể xóa", HttpStatus.CONFLICT),
    MEMBER_ALREADY_EXISTS("ERR_WS_07", "Người dùng đã là thành viên trong Workspace này", HttpStatus.CONFLICT),
    INVITE_EMAIL_NOT_FOUND("ERR_WS_08", "Email không tồn tại trong hệ thống", HttpStatus.BAD_REQUEST),
    WORKSPACE_MIN_ONE_ADMIN("ERR_WS_09", "Workspace phải có ít nhất một quản trị viên", HttpStatus.CONFLICT),
    INVITATION_INVALID("ERR_WS_10", "Lời mời đã hết hạn hoặc đã bị hủy", HttpStatus.BAD_REQUEST),
    INVITATION_WORKSPACE_GONE("ERR_WS_11", "Workspace này đã bị xóa hoặc không tồn tại", HttpStatus.GONE),
    LAST_ADMIN_CANNOT_LEAVE("ERR_WS_12", "Admin duy nhất không thể rời khỏi Workspace", HttpStatus.CONFLICT),
    EMAIL_ALREADY_EXISTS("ERR_US_01", "Email đã tồn tại trong hệ thống", HttpStatus.CONFLICT),
    WEAK_PASSWORD("ERR_US_02", "Mật khẩu không đủ độ mạnh", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS("ERR_US_03", "Sai thông tin đăng nhập", HttpStatus.UNAUTHORIZED),
    ACCOUNT_LOCKED("ERR_US_04", "Tài khoản đã bị khóa", HttpStatus.FORBIDDEN),
    UNAUTHORIZED("ERR_US_05", "Bạn cần đăng nhập để thực hiện thao tác này", HttpStatus.UNAUTHORIZED),
    TOKEN_INVALID("ERR_US_06", "Phiên đăng nhập không hợp lệ hoặc đã hết hạn", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED("ERR_US_07", "Bạn không có quyền truy cập tài nguyên này", HttpStatus.FORBIDDEN),
    PASSWORD_MISMATCH("ERR_US_09", "Mật khẩu xác nhận không khớp", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND("ERR_US_11", "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    PROJECT_NAME_EXISTS("ERR_PJ_01", "Tên dự án đã tồn tại trong Workspace", HttpStatus.CONFLICT),
    PROJECT_DATE_RANGE_INVALID("ERR_PJ_02", "Ngày kết thúc không được trước ngày bắt đầu", HttpStatus.BAD_REQUEST),
    PROJECT_NOT_FOUND("ERR_PJ_03", "Dự án không tồn tại", HttpStatus.NOT_FOUND),
    PROJECT_FORBIDDEN("ERR_PJ_04", "Bạn không có quyền thực hiện thao tác trên dự án này", HttpStatus.FORBIDDEN),
    PROJECT_LAST_PM("ERR_PJ_07", "Không thể xóa Project Manager duy nhất", HttpStatus.CONFLICT),
    ATTACHMENT_NOT_FOUND("ERR_PJ_08", "Tệp đính kèm không tồn tại", HttpStatus.NOT_FOUND),
    ATTACHMENT_TOO_LARGE("ERR_PJ_09", "File vượt quá dung lượng cho phép (tối đa 20MB)", HttpStatus.BAD_REQUEST),
    ATTACHMENT_TYPE_NOT_ALLOWED("ERR_PJ_10", "Định dạng file không được phép", HttpStatus.BAD_REQUEST),
    ATTACHMENT_FORBIDDEN("ERR_PJ_11", "Bạn không có quyền thao tác tệp đính kèm này", HttpStatus.FORBIDDEN),
    WORKSPACE_LOGO_NOT_FOUND("ERR_WS_13", "Workspace chưa có logo", HttpStatus.NOT_FOUND),
    WORKSPACE_LOGO_TOO_LARGE("ERR_WS_14", "Logo vượt quá dung lượng cho phép (tối đa 2MB)", HttpStatus.BAD_REQUEST),
    WORKSPACE_LOGO_TYPE_NOT_ALLOWED(
            "ERR_WS_15", "Logo chỉ hỗ trợ PNG, JPG, GIF hoặc WebP", HttpStatus.BAD_REQUEST),
    TASK_NOT_FOUND("ERR_TK_01", "Công việc không tồn tại", HttpStatus.NOT_FOUND),
    TASK_FORBIDDEN("ERR_TK_02", "Bạn không có quyền thao tác trên công việc này", HttpStatus.FORBIDDEN),
    TASK_STATUS_INVALID("ERR_TK_07", "Trạng thái công việc không hợp lệ", HttpStatus.BAD_REQUEST),
    TASK_COMMENT_NOT_FOUND("ERR_TK_08", "Bình luận không tồn tại", HttpStatus.NOT_FOUND),
    MILESTONE_NOT_FOUND("ERR_MS_03", "Milestone không tồn tại", HttpStatus.NOT_FOUND),
    VALIDATION_ERROR("ERR_VALIDATION", "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String defaultMessage;
    private final HttpStatus status;
}
