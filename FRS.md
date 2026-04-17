# TÀI LIỆU ĐẶC TẢ CHỨC NĂNG (FUNCTIONAL SPECIFICATIONS)

**Dự án:** Hệ thống Quản trị Dự án Nội bộ Tập trung (Unified Project Management System)  
**Tác giả:** Tuấn Anh & AI Assistant  
**Ngày lập:** 17/04/2026  
**Phiên bản:** 2.1.0 (Bản chi tiết cuối cùng)

---

## 1. GIỚI THIỆU (INTRODUCTION)

### 1.1 Mục đích
Tài liệu này đặc tả chi tiết các yêu cầu chức năng, giao diện và logic nghiệp vụ cho hệ thống Quản trị Dự án. Đây là căn cứ để đội ngũ kỹ thuật phát triển hệ thống và ban lãnh đạo nghiệm thu sản phẩm.

### 1.2 Mục tiêu cốt lõi
* **Xóa bỏ ốc đảo dữ liệu:** Kết nối Sales, Marketing và Engineering trên một nền tảng duy nhất.
* **Trải nghiệm Excel-Hybrid:** Tốc độ nhập liệu của Excel kết hợp với tính kỷ luật của phần mềm.
* **Minh bạch hóa:** Mọi thay đổi đều được lưu vết (Audit Log) và giải trình rõ ràng.

---

## 2. YÊU CẦU GIAO DIỆN BÊN NGOÀI

### 2.1 Giao diện người dùng (User Interfaces)
* **Grid View:** Giao diện lưới hỗ trợ Virtual Scroll (tải hàng ngàn dòng không lag), Inline Editing và phím tắt điều hướng.
* **Multi-View:** Chuyển đổi trạng thái hiển thị giữa Kanban (Thẻ), Gantt (Lộ trình), và Calendar (Lịch).

### 2.2 Giao diện phần mềm (Software Interfaces)
* **CRM Sync:** Tự động lấy dữ liệu hợp đồng thông qua API/Webhook.
* **SSO:** Đăng nhập một lần thông qua Google/Microsoft Azure AD.

---

## 3. ĐẶC TẢ CHI TIẾT CÁC MODULE CHỨC NĂNG

### 3.2.1 MODULE 1: QUẢN LÝ CẤU TRÚC & WORKSPACE

| Tính năng | Đầu vào | Quy trình xử lý | Quy tắc nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **Tạo Workspace** | Tên bộ phận, Manager. | Hệ thống khởi tạo vùng nhớ và phân quyền riêng biệt cho bộ phận. | Tên không trùng; Manager có quyền mời thành viên. |
| **Cross-linking** | Dự án nguồn, Workspace đích. | Tạo liên kết tham chiếu. Dữ liệu thay đổi tại nguồn sẽ tự cập nhật ở đích. | Chỉ Manager mới có quyền thiết lập liên kết liên phòng ban. |
| **Portfolio** | Danh mục dự án. | Gom nhóm các dự án cùng mục tiêu để theo dõi chỉ số tổng quát. | Chỉ Director xem được toàn bộ Portfolio công ty. |
| **Templates** | Loại dự án. | Sao chép cấu trúc Milestone và Task mẫu từ thư viện chuẩn. | Không cho phép sửa cấu trúc Template khi dự án đang chạy. |

### 3.2.2 MODULE 2: QUẢN LÝ CÔNG VIỆC CỐT LÕI (CORE ENGINE)

| Tính năng | Đầu vào | Quy trình xử lý | Quy tắc nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **Milestone** | Tên mốc, Deadline. | Điểm chặn quan trọng của dự án. | Không được "Done" Milestone nếu Task con chưa xong. |
| **Task & Sub-task** | Assignee, Trọng số. | Phân rã mục tiêu thành các đầu việc nhỏ nhất (Cấu trúc cây). | Bắt buộc có người phụ trách (Assignee). |
| **Dependencies** | Task A, Task B. | Thiết lập quan hệ (FS/SS). Task B chỉ bắt đầu khi Task A xong. | Tự động lùi Deadline Task B nếu Task A bị trễ hạn. |
| **Auto-Progress** | Trạng thái Task con. | Tính % hoàn thành dự án = Σ(tiến độ con * trọng số) / Σ trọng số. | Hệ thống tự tính; Tuyệt đối không cho nhập tay % ảo. |

### 3.2.3 MODULE 3: ĐA DẠNG GÓC NHÌN (MULTI-VIEW)

| Tính năng | Cơ chế hoạt động | Quy tắc tương tác |
| :--- | :--- | :--- |
| **Excel-Grid View** | Lưới dữ liệu tập trung. | Hỗ trợ Ctrl+C/Ctrl+V; Di chuyển ô bằng phím mũi tên; Enter để lưu. |
| **Kanban Board** | Thẻ công việc kéo thả. | Kéo thẻ qua cột trạng thái để cập nhật Database tức thời. |
| **Gantt Chart** | Trục thời gian trực quan. | Vẽ đường găng (Critical Path). Kéo dài thanh Bar để đổi Deadline. |
| **Calendar View** | Lịch làm việc. | Hiển thị Task theo ngày bắt đầu/kết thúc. Click để xem chi tiết. |

### 3.2.4 MODULE 4: CỘNG TÁC & LIÊN THÔNG (COLLABORATION)

| Tính năng | Đầu vào | Quy trình xử lý | Quy tắc nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **Contextual Chat** | Text, File, Emoji. | Thảo luận trực tiếp ngay trong cửa sổ chi tiết của từng Task. | Cấm xóa nội dung trao đổi để phục vụ lưu vết lịch sử. |
| **@Mention** | Ký tự @ + Tên. | Gửi thông báo đẩy (Push) và Email ngay lập tức cho người được nhắc. | Ưu tiên gợi ý thành viên trong cùng dự án. |
| **Notify Center** | Sự kiện hệ thống. | Chuông thông báo hiển thị Task quá hạn, yêu cầu phê duyệt mới. | Click thông báo dẫn trực tiếp vào nội dung cần xử lý. |

### 3.2.5 MODULE 5: QUẢN TRỊ KỶ LUẬT (GOVERNANCE)

| Tính năng | Cơ chế kiểm soát | Quy tắc bảo mật |
| :--- | :--- | :--- |
| **Audit Log** | Mọi thao tác. | Lưu: [Ai] - [Khi nào] - [Giá trị cũ] - [Giá trị mới]. | Dữ liệu Log là bất biến (Read-only), không ai được sửa xóa. |
| **Reason Entry** | Lệnh đổi Deadline. | Hiện Popup bắt buộc giải trình lý do thay đổi kế hoạch. | Lý do phải > 10 ký tự mới cho phép xác nhận lưu. |
| **Approval Flow** | Submit hoàn thành. | Task/Milestone chuyển trạng thái "Chờ duyệt" gửi tới Manager. | Khóa chỉnh sửa dữ liệu khi đang trong trạng thái chờ duyệt. |

### 3.2.6 MODULE 6: QUẢN LÝ TÀI NGUYÊN (RESOURCE MANAGEMENT)

| Tính năng | Mô tả xử lý | Quy tắc tính toán |
| :--- | :--- | :--- |
| **Workload Chart** | Dữ liệu giao việc. | Vẽ biểu đồ nhiệt (Heatmap) dựa trên tải trọng công việc của nhân sự. | Đỏ: > 100% tải; Xanh: Tối ưu; Xám: Đang rảnh. |
| **Work Calendar** | Lịch công ty. | Loại trừ Thứ 7, Chủ Nhật và Ngày lễ khỏi thời gian thực hiện Task. | Tự động cộng dồn Deadline nếu rơi vào ngày nghỉ. |

### 3.2.7 MODULE 7: BÁO CÁO & PHÂN TÍCH (REPORTING)

| Tính năng | Chỉ số (KPI) | Mục đích |
| :--- | :--- | :--- |
| **Dashboard** | Sức khỏe dự án. | Lãnh đạo xem tỷ lệ dự án Đúng hạn/Trễ hạn thời gian thực. |
| **KPI cá nhân** | On-time Completion. | Thống kê số lượng công việc hoàn thành đúng hạn của nhân viên. |
| **Issue Report** | Log giải trình. | Tổng hợp các lý do chậm trễ để cải tiến quy trình phòng ban. |

### 3.2.8 MODULE 8: TÍCH HỢP & BẢO MẬT (SYSTEM & SECURITY)

| Tính năng | Đặc tả kỹ thuật | Quy tắc bảo mật |
| :--- | :--- | :--- |
| **CRM Integration** | Webhook/API. | Tự khởi tạo dự án khi Hợp đồng được ký trên CRM. | Nếu thiếu File hợp đồng gốc, hệ thống chặn khởi tạo dự án. |
| **SSO** | OAuth2 / SAML. | Sử dụng tài khoản email công ty để đăng nhập duy nhất. | Tự động đăng xuất sau 30 phút nếu không có tương tác. |
| **Field-RBAC** | Phân quyền ô. | Phân quyền xem/sửa đến từng trường dữ liệu nhạy cảm (như Ngân sách). | Nhân viên thực thi không được thấy trường Chi phí dự án. |

---

## 4. YÊU CẦU PHI CHỨC NĂNG

### 4.1 Hiệu năng (Performance)
* **Thời gian phản hồi:** Lưu dữ liệu tại Grid < 200ms.
* **Tốc độ tải:** Mở Workspace 1000 Task < 2 giây.

### 4.2 Bảo mật (Security)
* **Mã hóa:** HTTPS cho đường truyền và AES-256 cho dữ liệu lưu trữ.
* **Sao lưu:** Tự động Full-Backup hàng ngày vào lúc 02:00 AM.

---

## 5. DANH SÁCH VẤN ĐỀ (ISSUES LIST)
* [I-01] Xử lý xung đột khi nhiều người cùng sửa một ô dữ liệu trong Grid View.
* [I-02] Cơ chế đồng bộ hóa dữ liệu từ các file Excel cũ có cấu trúc không đồng nhất.

---