# Tài liệu đặc tả chi tiết yêu cầu chức năng

l# Nền tảng Quản lý Dự án & Công việc Nội bộ — CTEL PM

> **Phiên bản:** 1.0
> **Ngày tạo:** 24/03/2026
> **Tác giả:** Project Management Office
> **Trạng thái:** Draft
> **Phân loại:** Nội bộ — Bảo mật

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Tổng quan mô tả](#2-tổng-quan-mô-tả)
3. [Yêu cầu chức năng](#3-yêu-cầu-chức-năng)
4. [Yêu cầu phi chức năng](#4-yêu-cầu-phi-chức-năng)
5. [Các yêu cầu chức năng khác](#5-các-yêu-cầu-chức-năng-khác)

## 1. Giới thiệu

### 1.1. Mục đích

Tài liệu này (FRS) chi tiết hóa các tính năng của hệ thống quản lý dự án, nhằm thống nhất logic nghiệp vụ giữa các bên. Đây là căn cứ để đội ngũ phát triển triển khai mã nguồn và đội ngũ QA/QC xây dựng kịch bản kiểm thử, đảm bảo hệ thống vận hành chính xác theo yêu cầu.

### 1.2. Quy ước tài liệu

| Viết tắt | Giải nghĩa                        |
| -------- | --------------------------------- |
| PM       | Project Management                |
| FRS      | Business Requirements Document    |
| QA/QC    | Quality Assurance/Quality Control |

### 1.3. Phạm vi yêu cầu

| #   | Hạng mục               | Mô tả                                                                                         |
| --- | ---------------------- | --------------------------------------------------------------------------------------------- |
| S1  | Quản lý Workspace      | Hệ thống cho phép tạo, cập nhật, xóa workspace; quản lý thành viên và phân quyền theo vai trò |
| S2  | Quản lý Project        | Hệ thống cho phép tạo, cập nhật, xóa project; gán thành viên và cấu hình project              |
| S3  | Quản lý Task           | Hệ thống hỗ trợ tạo, cập nhật, xóa task; gán assignee; quản lý trạng thái và deadline         |
| S4  | Cấu trúc phân cấp      | Hệ thống hỗ trợ cấu trúc dữ liệu: Workspace → Project → Milestone → Task → Sub-task           |
| S5  | Workflow trạng thái    | Hệ thống cho phép cấu hình luồng trạng thái (status flow) theo từng project type              |
| S6  | Quản lý tiến độ        | Hệ thống cung cấp theo dõi tiến độ thông qua milestone, dashboard và trạng thái task          |
| S7  | Cộng tác               | Hệ thống hỗ trợ comment, mention user, và lưu lịch sử hoạt động (activity log)                |
| S8  | Phân quyền truy cập    | Hệ thống áp dụng RBAC để kiểm soát truy cập theo role và phạm vi (workspace/project)          |
| S9  | Dashboard & báo cáo    | Hệ thống hiển thị tổng quan tiến độ project, task và workload của user                        |
| S10 | Xác thực người dùng    | Hệ thống hỗ trợ đăng ký, đăng nhập và quản lý phiên làm việc của người dùng                   |
| S11 | Intergration (HRM/CRM) | Cho phép liên kết thông tin từ nhiều hệ thống khác nhau trong công ty                         |

### 1.4. Tham chiếu

| Mã     | Tài liệu                        | Phiên bản |
| ------ | ------------------------------- | --------- |
| REF-01 | BRD: tài liệu yêu cầu nghiệp vụ | 1.0       |
| REF-02 | SRS: đặc tả chi tiết phần mềm   | 1.0       |

## 2. Mô tả tổng quan

### 2.1. Góc nhìn sản phẩm (Product perspective)

Hệ thống quản lý dự án là một ứng dụng Web độc lập, được xây dựng theo kiến trúc Backend (Java Spring Boot) và Frontend (ReactJS). Hệ thống tương tác trực tiếp với cơ sở dữ liệu PostgreSQL và sử dụng Kafka để xử lý các luồng thông báo thời gian thực, đảm bảo khả năng mở rộng và hiệu suất cao.

### 2.2. Tính năng sản phẩm (Product feature)

| STT | Bước quy trình                    | Người thực hiện       | Mô tả bước thực hiện                                                                                                                             |
| --- | --------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Thiết lập Workspace và người dùng | Admin, PM             | Tạo workspace cho phòng ban, thêm người dùng, gán vai trò và phân quyền truy cập hệ thống                                                        |
| 2   | Khởi tạo Project & phân quyền     | Manager               | Tạo dự án, nhập thông tin cơ bản và thiết lập quyền trong project, bao gồm việc chỉ định Lead (nếu có) để hỗ trợ quản lý và phân công công việc. |
| 3   | Lập kế hoạch & tạo Task           | Manager / Lead        | Xây dựng milestone và tạo các, xác định nội dung công, độ ưu, deadline và phạm vi thực hiện                                                      |
| 4   | Phân công & thực hiện Task        | Manager / Lead / User | Manager hoặc Lead phân công task cho nhân sự; User thực hiện công việc, cập nhật trạng thái, tiến độ và kết quả trên hệ thống                    |
| 5   | Theo dõi & điều chỉnh             | Manager / Lead        | Theo dõi tiến độ dự án thông qua dashboard, kiểm tra trạng thái task, xử lý task trễ hạn và điều chỉnh kế hoạch hoặc phân công khi cần           |
| 6   | Báo cáo & kết thúc                | Manager / Stakeholder | Xem báo cáo tổng hợp, đánh giá hiệu quả dự án và thực hiện đóng dự án khi hoàn thành                                                             |

### 2.3. Các nhóm người dùng và đặc điểm (User classes and characteristics)

Hệ thống được thiết kế dựa trên mô hình phân quyền dựa trên vai trò (RBAC), chia thành các nhóm người dùng chính sau:

| Nhóm người dùng | Đặc điểm và Trách nhiệm | Tần suất sử dụng |
| :--- | :--- | :--- |
| **Admin (Hệ thống)** | Quản trị viên cấp cao. Có toàn quyền trên toàn hệ thống: quản lý Workspace, cấu hình hệ thống, quản lý tài khoản người dùng và giám sát Logs. | Thấp (Khi cần cấu hình hoặc bảo trì) |
| **Manager (Quản lý)** | Thường là Trưởng bộ phận hoặc Giám đốc dự án. Có quyền tạo Project, thiết lập ngân sách/phạm vi, phê duyệt báo cáo cuối kỳ và đóng dự án. | Trung bình (Đầu và cuối dự án) |
| **Project Lead (PM)** | Người điều phối chính. Trách nhiệm lập kế hoạch, chia Milestone, tạo Task, phân công nhân sự và kiểm soát tiến độ thực tế hàng ngày. | Rất cao (Hàng ngày) |
| **User (Nhân viên)** | Thành viên thực hiện dự án. Có quyền xem danh sách Task được giao, cập nhật trạng thái công việc, gửi file đính kèm và thảo luận trên Task. | Rất cao (Thường xuyên) |
| **Stakeholder** | Khách hàng hoặc các bên liên quan. Chỉ có quyền xem (View-only) đối với các Dashboard, báo cáo và tiến độ dự án mà họ được mời tham gia. | Thấp (Theo định kỳ báo cáo) |

---

### 2.4. Môi trường hoạt động (Operating environment)

* **Phần mềm:** Hệ thống chạy trên nền tảng Web, tương thích với các trình duyệt hiện đại (Chrome, Edge, Firefox, Safari).
* **Phần cứng:** Server lưu trữ yêu cầu cấu hình tối ưu cho Java Spring Boot và cơ sở dữ liệu PostgreSQL.
* **Kết nối:** Yêu cầu kết nối mạng ổn định để đồng bộ dữ liệu thời gian thực qua Kafka.

### 2.5. Các giả định và phụ thuộc (Assumptions and dependencies)

## 3. Yêu cầu chức năng (Functional requirements)

### 3.1. Workspace module

#### 3.1.1. Workspace Admin (Quản trị viên Workspace)
| # | Chức năng | Chi tiết logic chức năng | Kết quả mong đợi |
|:---|:---|:---|:---|
| **FR-01** | **Tạo Workspace** | **Mô tả:** Khởi tạo không gian làm việc mới cho phòng ban hoặc nhóm dự án.<br>**Điều kiện tiên quyết:** Người dùng đã đăng nhập thành công vào hệ thống và phải là admin.<br>**Luồng xử lý chính:** <br>1. Chọn "Tạo Workspace".<br>2. Nhập các trường: Tên, Mô tả, tải lên Avatar.<br>3. Hệ thống validate dữ liệu.<br>4. Lưu thông tin vào PostgreSQL.<br>**Quy tắc nghiệp vụ:** Tên Workspace là duy nhất, không được để trống, tối đa 100 ký tự. Người tạo mặc định là Admin của Workspace đó.<br>**Thông báo lỗi:** <br>- `ERR_WS_01`: Tên Workspace đã tồn tại.<br>- `ERR_WS_02`: Định dạng ảnh không hợp lệ. | Workspace mới được khởi tạo và hiển thị ở đầu danh sách; User được chuyển hướng vào màn hình Dashboard của Workspace. |
| **FR-02** | **Cập nhật Workspace** | **Mô tả:** Thay đổi thông tin hiển thị hoặc trạng thái hoạt động của Workspace.<br>**Điều kiện tiên quyết:** User có vai trò là Workspace Admin.<br>**Luồng xử lý chính:** <br>1. Truy cập mục "Cài đặt Workspace".<br>2. Chỉnh sửa thông tin cần thiết.<br>3. Nhấn "Lưu thay đổi".<br>4. Hệ thống cập nhật DB và đẩy message qua Kafka để đồng bộ UI.<br>**Quy tắc nghiệp vụ:** Không cho phép đổi tên trùng với Workspace khác đang tồn tại (ngoại trừ tên hiện tại).<br>**Thông báo lỗi:** <br>- `ERR_WS_03`: Workspace không tồn tại.<br>- `ERR_WS_04`: Bạn không có quyền chỉnh sửa thông tin này. | Thông tin cập nhật thành công; Tất cả thành viên trong Workspace nhận được thông báo cập nhật thời gian thực. |
| **FR-03** | **Xóa Workspace** | **Mô tả:** Loại bỏ Workspace khỏi hệ thống (Xóa logic/Soft-delete).<br>**Điều kiện tiên quyết:** User là Workspace Admin; Không còn Project nào đang ở trạng thái "In Progress".<br>**Luồng xử lý chính:** <br>1. Chọn "Xóa Workspace".<br>2. Pop-up yêu cầu nhập lại chính xác tên Workspace để xác nhận.<br>3. Hệ thống cập nhật trường `is_deleted = true`.<br>**Quy tắc nghiệp vụ:** Chỉ được xóa khi không còn dự án/công việc đang thực hiện. Dữ liệu (Project, Task) sẽ bị ẩn theo Workspace.<br>**Thông báo lỗi:** <br>- `ERR_WS_05`: Tên xác nhận không khớp.<br>- `ERR_WS_06`: Vẫn còn dự án đang hoạt động, không thể xóa. | Workspace biến mất khỏi danh sách của tất cả người dùng; Toàn bộ tài nguyên liên quan bị khóa truy cập. |
| **FR-06** | **Mời Thành viên** | **Mô tả:** Thêm nhân sự vào Workspace để làm việc.<br>**Điều kiện tiên quyết:** Workspace Admin; User được mời phải có tài khoản trên hệ thống HRM.<br>**Luồng xử lý chính:** <br>1. Nhập Email/Username hoặc chọn từ danh sách HRM.<br>2. Chọn vai trò (Admin/Member).<br>3. Nhấn "Gửi lời mời".<br>**Quy tắc nghiệp vụ:** Không mời người đã là thành viên. Lời mời có hiệu lực trong vòng 48 giờ thông qua link/thông báo.<br>**Thông báo lỗi:** <br>- `ERR_WS_07`: Người dùng đã là thành viên trong Workspace này.<br>- `ERR_WS_08`: Email không tồn tại trong hệ thống HRM. | Hệ thống gửi thông báo/Email mời; Trạng thái thành viên hiển thị là "Pending" trong danh sách quản lý thành viên. |
| **FR-08** | **Cập nhật Vai trò** | **Mô tả:** Thay đổi quyền hạn (Admin/Member) của người dùng trong Workspace.<br>**Điều kiện tiên quyết:** Workspace Admin; User mục tiêu đang hoạt động trong Workspace.<br>**Luồng xử lý chính:** <br>1. Tại danh sách Member, chọn "Sửa quyền".<br>2. Chọn Role mới (Admin hoặc Member).<br>3. Xác nhận thay đổi.<br>**Quy tắc nghiệp vụ:** Workspace phải luôn duy trì ít nhất 01 Admin. Chặn việc tự hạ quyền nếu là Admin duy nhất.<br>**Thông báo lỗi:** <br>- `ERR_WS_09`: Workspace phải có ít nhất một quản trị viên. | Quyền hạn của User được cập nhật ngay lập tức; Token/Session của User đó được cập nhật lại thông qua Redis. |

#### 3.1.2. Member (Thành viên)
| # | Chức năng | Chi tiết logic chức năng | Kết quả mong đợi |
|:---|:---|:---|:---|
| **FR-03** | **Tham gia Workspace** | **Mô tả:** Chấp nhận lời mời để truy cập vào không gian làm việc.<br>**Điều kiện tiên quyết:** User nhận được thông báo mời tham gia từ Admin.<br>**Luồng xử lý chính:** <br>1. Click vào thông báo mời.<br>2. Nhấn "Chấp nhận" (Accept) hoặc "Từ chối" (Decline).<br>**Quy tắc nghiệp vụ:** Nếu quá 48h chưa xác nhận, link mời tự động vô hiệu hóa.<br>**Thông báo lỗi:** <br>- `ERR_WS_10`: Lời mời đã hết hạn hoặc đã bị Admin hủy.<br>- `ERR_WS_11`: Workspace này đã bị xóa hoặc không còn tồn tại. | Nếu Accept: User thấy Workspace trong menu điều hướng. Nếu Decline: Hệ thống xóa lời mời và thông báo cho Admin. |
| **FR-04** | **Rời khỏi Workspace** | **Mô tả:** Tự nguyện rút tên khỏi Workspace.<br>**Điều kiện tiên quyết:** User đang là thành viên; Không phải là Admin duy nhất của Workspace.<br>**Luồng xử lý chính:** <br>1. Vào màn hình Thông tin Workspace.<br>2. Chọn "Rời khỏi Workspace".<br>3. Xác nhận tại Pop-up.<br>**Quy tắc nghiệp vụ:** Sau khi rời, các Task đang gán (Assign) cho User này sẽ chuyển về trạng thái "Unassigned".<br>**Thông báo lỗi:** <br>- `ERR_WS_12`: Admin duy nhất không thể rời khỏi Workspace trước khi bàn giao quyền. | User không còn quyền truy cập vào Workspace; Admin nhận được thông báo hệ thống về việc nhân sự rời đi. |

#### 3.1.3. Đặc tả thành phần giao diện (UI Specification)

| ID | Chức năng | Các thành phần giao diện (UI Elements) | Hành động (Actions) |
|:---|:---|:---|:---|
| **UI-01** | **Tạo Workspace** | - Modal popup.<br>- Input: Tên Workspace (Text).<br>- Textarea: Mô tả (Paragraph).<br>- Upload: Icon/Logo (Drag & Drop). | - Click "Lưu": Gửi request tạo.<br>- Click "Hủy": Đóng modal. |
| **UI-02** | **Danh sách Workspace** | - Dạng Card View hoặc List View.<br>- Thanh tìm kiếm (Search bar).<br>- Bộ lọc trạng thái (Active/Archived). | - Click vào Card: Chuyển hướng vào Project bên trong.<br>- Click Icon "Ba chấm": Mở menu Sửa/Xóa. |
| **UI-03** | **Quản lý Thành viên** | - Table: Avatar, Tên, Email, Vai trò, Ngày tham gia.<br>- Button: "Mời thành viên".<br>- Searchbox: Tìm kiếm user trong hệ thống. | - Chọn Role từ Dropdown: Cập nhật quyền trực tiếp.<br>- Click "Xóa": Hiện popup xác nhận loại bỏ user. |
| **UI-04** | **Mời User** | - Input: Nhập Email hoặc tìm theo Username.<br>- Radio button: Chọn Role (Admin/Member).<br>- Badge: Hiển thị trạng thái "Pending" cho lời mời chưa xác nhận. | - Click "Gửi": Gửi thông báo/email mời.<br>- Click "Hủy": Quay lại danh sách. |

#### 3.1.4. Thiết kế cơ sở dữ liệu (Database Mapping)

| Tên bảng (Table) | Chức năng liên quan | Các trường dữ liệu chính (Main Fields) | Ghi chú |
|:---|:---|:---|:---|
| **workspaces** | UI-01, UI-02 | `id` (PK), `name` (unique), `description`, `logo_url`, `owner_id` (FK), `status`, `is_deleted`. | Lưu thông tin định danh và cấu hình của không gian làm việc. |
| **workspace_members** | UI-03 | `id` (PK), `workspace_id` (FK), `user_id` (FK), `role_id` (FK), `joined_at`. | Quản lý mối quan hệ giữa người dùng và Workspace. |
| **workspace_invitations** | UI-04 | `id` (PK), `workspace_id` (FK), `email`, `inviter_id` (FK), `status` (pending/accepted), `token`, `expired_at`. | Lưu trữ các lời mời tham gia chưa được xác nhận. |
| **roles** | UI-03, UI-04 | `id` (PK), `role_name` (Admin/Member), `permissions` (JSON/Text). | Định nghĩa các quyền hạn cụ thể cho từng vai trò. |

### 3.2. Project Module
#### 3.2.1. Project Admin & Project Manager
*Lưu ý: Project Admin (thường là Workspace Admin) có toàn quyền, trong khi Project Manager có quyền trong phạm vi các dự án được chỉ định.*

| # | Chức năng | Chi tiết logic chức năng | Kết quả mong đợi |
|:---|:---|:---|:---|
| **FR-01** | **Tạo Project** | **Mô tả:** Khởi tạo dự án mới bên trong một Workspace.<br>**ĐK tiên quyết:** User có quyền Admin hoặc Manager được cấp phép tạo dự án.<br>**Luồng chính:** 1. Chọn "New Project" -> 2. Nhập Tên, Loại dự án (Kanban/Scrum), Ngày bắt đầu/kết thúc, Mô tả -> 3. Hệ thống validate -> 4. Khởi tạo Project & Milestone mặc định.<br>**Quy tắc:** Tên Project phải là duy nhất trong cùng một Workspace. Ngày kết thúc không được trước ngày bắt đầu.<br>**Thông báo lỗi:** `ERR_PJ_01`: Tên dự án đã tồn tại trong Workspace; `ERR_PJ_02`: Khoảng thời gian không hợp lệ. | Dự án mới hiển thị trong Workspace; Hệ thống tự động gán người tạo làm Project Manager. |
| **FR-02** | **Cập nhật Project** | **Mô tả:** Chỉnh sửa thông tin hành chính hoặc trạng thái dự án.<br>**ĐK tiên quyết:** Quyền Admin/Manager của Project đó.<br>**Luồng chính:** 1. Vào Project Settings -> 2. Sửa thông tin/Trạng thái (Active, On Hold, Completed, Archived) -> 3. Lưu.<br>**Quy tắc:** Khi chuyển sang trạng thái `Archived`, tất cả các Task bên trong sẽ bị khóa chỉnh sửa.<br>**Thông báo lỗi:** `ERR_PJ_03`: Project không tồn tại; `ERR_PJ_04`: Không có quyền cập nhật trạng thái này. | Thông tin được cập nhật; Gửi thông báo thay đổi trạng thái dự án đến toàn bộ thành viên qua Kafka. |
| **FR-03** | **Xóa Project** | **Mô tả:** Xóa dự án khỏi Workspace (Soft-delete).<br>**ĐK tiên quyết:** Quyền Admin hệ thống hoặc Workspace Admin.<br>**Luồng chính:** 1. Chọn Xóa dự án -> 2. Xác nhận qua mật khẩu hoặc mã captcha -> 3. Hệ thống đánh dấu `is_deleted = true`.<br>**Quy tắc:** Không thể xóa dự án nếu đang có các Task liên kết với hệ thống HRM/Tài chính chưa quyết toán (nếu có tích hợp).<br>**Thông báo lỗi:** `ERR_PJ_05`: Không thể xóa dự án đang có giao dịch tài chính dở dang. | Project ẩn khỏi danh sách; Toàn bộ Milestone/Task thuộc Project bị ẩn đồng bộ trong DB. |
| **FR-06** | **Quản lý Thành viên (Thêm/Xóa/Sửa)** | **Mô tả:** Quản lý nhân sự thực hiện trong dự án.<br>**ĐK tiên quyết:** Quyền Project Manager hoặc cao hơn.<br>**Luồng chính:** 1. Chọn từ danh sách Member của Workspace -> 2. Gán Role trong Project (Lead/Member/Viewer) -> 3. Xác nhận.<br>**Quy tắc:** Chỉ những User đã thuộc Workspace mới được thêm vào Project. Dự án phải có ít nhất 1 Manager.<br>**Thông báo lỗi:** `ERR_PJ_06`: User chưa tham gia Workspace; `ERR_PJ_07`: Không thể xóa Manager duy nhất. | User nhận được thông báo được gán vào dự án; Quyền truy cập các Task trong dự án được kích hoạt. |
| **FR-08** | **Xem tiến độ Project** | **Mô tả:** Theo dõi sức khỏe dự án qua các chỉ số trực quan.<br>**ĐK tiên quyết:** Tất cả thành viên trong Project.<br>**Luồng chính:** Hệ thống tổng hợp dữ liệu từ Task: % hoàn thành, số Task trễ hạn, Burn-down chart -> Hiển thị Dashboard.<br>**Quy tắc:** Dữ liệu Dashboard được cập nhật real-time hoặc định kỳ mỗi 5 phút qua Redis Cache.<br>**Thông báo lỗi:** `ERR_PJ_08`: Lỗi lấy dữ liệu thống kê. | Dashboard hiển thị biểu đồ và các con số chính xác theo trạng thái Task hiện tại. |

#### 3.2.2. Member (Thành viên dự án)

| # | Chức năng | Chi tiết logic chức năng | Kết quả mong đợi |
|:---|:---|:---|:---|
| **FR-01** | **Xem danh sách Project** | **Mô tả:** Xem các dự án mà mình tham gia.<br>**ĐK tiên quyết:** Đã được add vào ít nhất 1 dự án.<br>**Luồng chính:** Hệ thống lọc danh sách dự án dựa trên User ID và quyền truy cập trong bảng Project_Members.<br>**Quy tắc:** Chỉ hiển thị các dự án Active hoặc Archived (nếu có quyền), không hiển thị dự án đã xóa hoặc dự án chưa được mời. | Danh sách dự án hiển thị kèm theo vai trò của User trong dự án đó. |
| **FR-02** | **Xem chi tiết Project** | **Mô tả:** Truy cập vào không gian làm việc của một dự án cụ thể.<br>**ĐK tiên quyết:** Thành viên của dự án.<br>**Luồng chính:** 1. Click vào Project -> 2. Hệ thống load Milestone, Task list và Board view.<br>**Quy tắc:** Quyền xem (Read-only) hay chỉnh sửa (Write) phụ thuộc vào Role được gán ở FR-06 phía trên.<br>**Thông báo lỗi:** `ERR_PJ_09`: Bạn đã bị loại khỏi dự án này. | Giao diện Project Board hiển thị đầy đủ các cột trạng thái và danh sách công việc. |

#### 3.2.3. Đặc tả thành phần giao diện (UI Specification)

| ID | Chức năng | Các thành phần giao diện (UI Elements) | Hành động (Actions) |
|:---|:---|:---|:---|
| **UI-PJ-01** | **Tạo Project** | - Modal popup.<br>- Input: Tên dự án (Text).<br>- Dropdown: Loại dự án (Kanban/Scrum).<br>- Date Picker: Ngày bắt đầu & Ngày kết thúc.<br>- Textarea: Mô tả dự án. | - Click "Khởi tạo": Validate dữ liệu và tạo dự án.<br>- Click "Hủy": Đóng modal. |
| **UI-PJ-02** | **Danh sách Project** | - Dạng Card View: Hiển thị tiêu đề, % tiến độ (Progress bar), Avatars thành viên.<br>- Bộ lọc (Filter): Theo trạng thái (Active, Completed, Archived). | - Click vào Card: Truy cập vào chi tiết dự án.<br>- Click Icon "Cài đặt": Mở trang cấu hình Project. |
| **UI-PJ-03** | **Quản lý Thành viên** | - Tab "Members" trong Project.<br>- Table: Tên, Email, Vai trò trong dự án (Project Role), Ngày gia nhập.<br>- Button: "Thêm thành viên" (mở danh sách Member từ Workspace). | - Chọn Role từ Dropdown: Cập nhật quyền (Lead/Member/Viewer).<br>- Click "Loại bỏ": Popup xác nhận xóa user khỏi dự án. |
| **UI-PJ-04** | **Dashboard Project** | - Biểu đồ hình tròn (Pie chart): Trạng thái Task.<br>- Biểu đồ đường (Burn-down chart).<br>- Widget: Tổng số Task, Task quá hạn, Task hoàn thành. | - Hover vào biểu đồ: Xem số liệu chi tiết.<br>- Click Widget: Chuyển hướng nhanh đến danh sách Task tương ứng. |
| **UI-PJ-05** | **Cấu hình Project** | - Form chỉnh sửa thông tin chung.<br>- Dropdown Trạng thái: Active, On Hold, Completed, Archived.<br>- Button: "Xóa dự án" (màu đỏ). | - Click "Cập nhật": Lưu thông tin mới.<br>- Click "Xóa dự án": Hiển thị Modal yêu cầu nhập mật khẩu xác nhận. |

#### 3.2.4. Thiết kế cơ sở dữ liệu (Database Mapping)

| Tên bảng (Table) | Chức năng liên quan | Các trường dữ liệu chính (Main Fields) | Ghi chú |
|:---|:---|:---|:---|
| **projects** | UI-PJ-01, UI-PJ-02, UI-PJ-05 | `id` (PK), `workspace_id` (FK), `name`, `type` (Kanban/Scrum), `description`, `start_date`, `end_date`, `status`, `is_deleted`. | Lưu thông tin cốt lõi của dự án. `status` dùng để điều khiển quyền ghi (Read-only khi Archived). |
| **project_members** | UI-PJ-03 | `id` (PK), `project_id` (FK), `user_id` (FK), `project_role_id` (FK), `joined_at`. | Quản lý nhân sự trong từng dự án. `user_id` phải tồn tại trong `workspace_members`. |
| **project_roles** | UI-PJ-03 | `id` (PK), `role_name` (Lead, Member, Viewer), `permissions` (JSON). | Định nghĩa quyền hạn cụ thể trong phạm vi dự án (khác với Role của Workspace). |
| **project_stats** (View/Redis) | UI-PJ-04 | `project_id`, `total_tasks`, `completed_tasks`, `overdue_tasks`, `last_updated`. | Dữ liệu tổng hợp để phục vụ Dashboard, nên được lưu ở Redis để truy vấn nhanh. |

### 3.3. Milestone Module
#### 3.3.1. Project Manager (Quản lý dự án)

| # | Chức năng | Chi tiết logic chức năng | Kết quả mong đợi |
|:---|:---|:---|:---|
| **FR-01** | **Tạo Milestone** | **Mô tả:** Thiết lập các mốc quan trọng để theo dõi tiến độ dự án.<br>**Điều kiện tiên quyết:** User có role Project Manager hoặc Project Admin trong dự án đó.<br>**Luồng xử lý chính:** 1. Chọn "Thêm Milestone" -> 2. Nhập: Tên, Mô tả, Ngày đến hạn (Due date) -> 3. Hệ thống validate thời gian -> 4. Lưu vào PostgreSQL.<br>**Quy tắc nghiệp vụ:** Tên Milestone là duy nhất trong một dự án. Ngày đến hạn của Milestone phải nằm trong khoảng thời gian Start Date và End Date của Project.<br>**Thông báo lỗi:** `ERR_MS_01`: Tên Milestone đã tồn tại; `ERR_MS_02`: Ngày đến hạn nằm ngoài phạm vi thời gian của dự án. | Milestone mới được tạo thành công và hiển thị trên thanh tiến độ (Roadmap/Gantt Chart) của dự án. |
| **FR-02** | **Cập nhật Milestone** | **Mô tả:** Thay đổi thông tin hoặc điều chỉnh thời hạn của cột mốc.<br>**Điều kiện tiên quyết:** Project Manager; Milestone chưa ở trạng thái "Completed".<br>**Luồng xử lý chính:** 1. Chọn Milestone cần sửa -> 2. Chỉnh sửa thông tin -> 3. Hệ thống kiểm tra lại ràng buộc thời gian -> 4. Cập nhật & thông báo qua Kafka.<br>**Quy tắc nghiệp vụ:** Nếu ngày đến hạn bị thay đổi, hệ thống sẽ gửi cảnh báo nếu có các Task thuộc Milestone này có Deadline muộn hơn ngày mới.<br>**Thông báo lỗi:** `ERR_MS_03`: Milestone không tồn tại; `ERR_MS_04`: Không thể chỉnh sửa Milestone của dự án đã đóng. | Thông tin Milestone được cập nhật; Gửi thông báo đến toàn bộ Member trong dự án về sự thay đổi thời hạn. |
| **FR-03** | **Xóa Milestone** | **Mô tả:** Xóa bỏ cột mốc không còn cần thiết.<br>**Điều kiện tiên quyết:** Project Manager.<br>**Luồng xử lý chính:** 1. Chọn Xóa -> 2. Xác nhận tại Pop-up -> 3. Hệ thống thực hiện Soft-delete.<br>**Quy tắc nghiệp vụ:** Khi xóa Milestone, các Task đang liên kết với Milestone này sẽ không bị xóa mà chuyển về trạng thái "No Milestone".<br>**Thông báo lỗi:** `ERR_MS_05`: Lỗi hệ thống khi xóa dữ liệu. | Milestone biến mất khỏi danh sách và biểu đồ tiến độ; Các Task liên quan được cập nhật lại metadata. |
| **FR-04** | **Xem danh sách Milestone** | **Mô tả:** Truy xuất toàn bộ các mốc thời gian của dự án.<br>**Điều kiện tiên quyết:** Thành viên thuộc dự án.<br>**Luồng xử lý chính:** Hệ thống truy vấn danh sách Milestone theo Project ID, sắp xếp theo thứ tự thời gian tăng dần.<br>**Quy tắc nghiệp vụ:** Hiển thị kèm theo % hoàn thành của từng Milestone (tính dựa trên số Task đã Done thuộc Milestone đó). | Danh sách hiển thị rõ ràng Tên, Thời hạn, Trạng thái và % tiến độ. |
| **FR-05** | **Xem chi tiết Milestone** | **Mô tả:** Xem chi tiết mục tiêu và các công việc thuộc cột mốc.<br>**Điều kiện tiên quyết:** Thành viên thuộc dự án.<br>**Luồng xử lý chính:** 1. Click vào Milestone -> 2. Hệ thống load thông tin mô tả và danh sách các Task gắn với Milestone này.<br>**Quy tắc nghiệp vụ:** Cho phép lọc nhanh các Task theo trạng thái ngay trong màn hình chi tiết Milestone. | Hiển thị đầy đủ thông tin chi tiết và danh sách các đầu việc liên quan. |

#### 3.3.2. Member (Thành viên)

| # | Chức năng | Chi tiết logic chức năng | Kết quả mong đợi |
|:---|:---|:---|:---|
| **FR-01** | **Xem danh sách Milestone** | **Mô tả:** Theo dõi lộ trình tổng thể của dự án.<br>**Điều kiện tiên quyết:** Member đã được gán vào dự án.<br>**Luồng xử lý chính:** Truy cập tab Milestone để xem timeline.<br>**Quy tắc nghiệp vụ:** Member chỉ có quyền xem (Read-only), không có quyền kéo thả thay đổi thời hạn trên biểu đồ. | Hiển thị danh sách các mốc quan trọng để Member nắm bắt kế hoạch chung. |
| **FR-02** | **Xem chi tiết Milestone** | **Mô tả:** Tìm hiểu mục tiêu cụ thể của từng giai đoạn.<br>**Điều kiện tiên quyết:** Member đã được gán vào dự án.<br>**Luồng xử lý chính:** Click xem chi tiết để biết mình cần hoàn thành những Task nào cho cột mốc này.<br>**Quy tắc nghiệp vụ:** Hiển thị rõ ràng các Task mà Member đó được Assign trong phạm vi Milestone đang xem. | Member nắm bắt được mục tiêu cần đạt được và danh sách công việc cá nhân cần hoàn thành. |

#### 3.3.3. Đặc tả thành phần giao diện (UI Specification)

| ID | Chức năng | Các thành phần giao diện (UI Elements) | Hành động (Actions) |
|:---|:---|:---|:---|
| **UI-MS-01** | **Tạo/Cập nhật Milestone** | - Modal popup.<br>- Input: Tên Milestone (Text).<br>- Date Picker: Ngày đến hạn (Due date).<br>- Textarea: Mô tả mục tiêu.<br>- Status Badge: Trạng thái (In Progress/Completed). | - Click "Lưu": Hệ thống kiểm tra ràng buộc thời gian với Project và lưu dữ liệu.<br>- Click "Hủy": Đóng modal không lưu. |
| **UI-MS-02** | **Danh sách Milestone** | - Tab "Milestones" bên trong màn hình Project.<br>- Dạng List hoặc Timeline: Hiển thị tên mốc, ngày đến hạn, thanh tiến độ (Progress bar %).<br>- Filter: Lọc theo trạng thái. | - Click vào Card/Hàng: Mở màn hình chi tiết Milestone.<br>- Click "Sửa/Xóa": Thực hiện chỉnh sửa hoặc xóa mốc (Chỉ dành cho Manager). |
| **UI-MS-03** | **Chi tiết Milestone** | - Header: Hiển thị tên mốc, mô tả và tổng % tiến độ.<br>- Task List: Danh sách các công việc được gắn vào Milestone này.<br>- Status Toggle: Nút chuyển đổi trạng thái hoàn thành. | - Click Task: Chuyển hướng nhanh đến màn hình chi tiết công việc.<br>- Click "Đánh dấu hoàn thành": Chuyển trạng thái sang Completed. |
| **UI-MS-04** | **Lộ trình (Roadmap)** | - Biểu đồ Timeline hiển thị các Milestone theo thứ tự thời gian thực tế. | - Hover: Xem nhanh mô tả và số lượng Task thuộc mốc đó.<br>- Kéo thả: Thay đổi ngày đến hạn trực tiếp trên biểu đồ (Dành cho Manager). |

#### 3.3.4. Thiết kế cơ sở dữ liệu (Database Mapping)

| Tên bảng (Table) | Chức năng liên quan | Các trường dữ liệu chính (Main Fields) | Ghi chú |
|:---|:---|:---|:---|
| **milestones** | UI-MS-01, UI-MS-02, UI-MS-03 | `id` (PK), `project_id` (FK), `name`, `description`, `due_date`, `status` (Pending/Completed), `is_deleted`. | Lưu trữ các cột mốc thời gian của dự án. `due_date` cần được đánh Index để tối ưu truy vấn. |
| **tasks** | UI-MS-03 | `id` (PK), `milestone_id` (FK), `status`, `title`... | Trường `milestone_id` được dùng làm khóa ngoại để liên kết các đầu việc vào một mốc thời gian cụ thể. |

### 3.4. Task Module
#### 3.4.1. Project Manager (Quản lý dự án)
| # | Chức năng | Chi tiết logic chức năng | Kết quả mong đợi |
|:---|:---|:---|:---|
| **FR-01** | **Tạo Task** | **Mô tả:** Khởi tạo công việc mới trong Project/Milestone.<br>**ĐK tiên quyết:** Quyền Manager/Lead trong dự án.<br>**Luồng chính:** 1. Nhấn "Tạo Task" -> 2. Nhập Tiêu đề, Mô tả, Priority (Low/Medium/High/Urgent), Deadline -> 3. Chọn Milestone (nếu có) -> 4. Lưu DB.<br>**Quy tắc:** Tiêu đề không để trống. Deadline của Task không được vượt quá Deadline của Milestone liên kết.<br>**Thông báo lỗi:** `ERR_TK_01`: Deadline không hợp lệ; `ERR_TK_02`: Milestone đã kết thúc. | Task mới xuất hiện trên Dashboard/Board; Ghi nhận vào Activity Log của dự án. |
| **FR-02** | **Cập nhật Task** | **Mô tả:** Chỉnh sửa nội dung hoặc thuộc tính của công việc.<br>**ĐK tiên quyết:** Quyền Manager/Lead hoặc người tạo Task.<br>**Luồng chính:** 1. Mở chi tiết Task -> 2. Sửa thông tin -> 3. Hệ thống lưu version mới và đẩy thông báo qua Kafka.<br>**Quy tắc:** Mọi thay đổi về nội dung quan trọng phải được ghi lại trong lịch sử (Activity Log) để truy xuất.<br>**Thông báo lỗi:** `ERR_TK_03`: Task không tồn tại; `ERR_TK_04`: Bạn không có quyền chỉnh sửa. | Thông tin cập nhật thành công; Các thành viên đang theo dõi Task nhận được thông báo thời gian thực. |
| **FR-03** | **Xóa Task** | **Mô tả:** Loại bỏ công việc (Soft-delete).<br>**ĐK tiên quyết:** Quyền Manager/Lead.<br>**Luồng chính:** 1. Chọn Xóa -> 2. Xác nhận -> 3. Đổi trạng thái `is_deleted = true`.<br>**Quy tắc:** Khi xóa Task cha, toàn bộ Sub-task liên quan cũng sẽ bị ẩn theo.<br>**Thông báo lỗi:** `ERR_TK_05`: Lỗi hệ thống khi xóa dữ liệu. | Task và Sub-task biến mất khỏi giao diện; ID Task vẫn được giữ lại trong DB để phục vụ audit. |
| **FR-06** | **Assign Task** | **Mô tả:** Gán người chịu trách nhiệm thực hiện công việc.<br>**ĐK tiên quyết:** Quyền Manager/Lead.<br>**Luồng chính:** 1. Chọn Assignee từ danh sách thành viên dự án -> 2. Lưu thay đổi -> 3. Hệ thống gửi thông báo "You have a new task".<br>**Quy tắc:** Một Task có thể gán cho một hoặc nhiều người (tùy cấu hình Project). Người được gán phải thuộc dự án đó.<br>**Thông báo lỗi:** `ERR_TK_06`: User không thuộc dự án này. | Assignee nhận được thông báo qua hệ thống/Email; Avatar của Assignee hiển thị trên Task Card. |
| **FR-07** | **Cập nhật Trạng thái** | **Mô tả:** Thay đổi trạng thái xử lý của công việc.<br>**ĐK tiên quyết:** Manager hoặc Assignee của Task đó.<br>**Luồng chính:** 1. Kéo thả trên Board hoặc chọn Status mới -> 2. Hệ thống kiểm tra Workflow (S5) -> 3. Cập nhật trạng thái.<br>**Quy tắc:** Phải tuân thủ luồng trạng thái đã cấu hình (Ví dụ: Không thể nhảy từ `Todo` sang `Done` nếu bắt buộc qua `Review`).<br>**Thông báo lỗi:** `ERR_TK_07`: Bước chuyển trạng thái không hợp lệ theo Workflow. | Trạng thái thay đổi trên giao diện; Tiến độ Project (%) được tính toán lại tự động. |
| **FR-08** | **Cập nhật Deadline/Priority** | **Mô tả:** Điều chỉnh thời hạn hoặc mức độ ưu tiên khẩn cấp.<br>**ĐK tiên quyết:** Quyền Manager/Lead.<br>**Luồng chính:** Thay đổi trực tiếp tại màn hình danh sách hoặc chi tiết.<br>**Quy tắc:** Nếu Task bị quá hạn (Overdue), hệ thống tự động đổi màu tiêu đề và gửi thông báo nhắc nhở qua Kafka.<br>**Thông báo lỗi:** `ERR_TK_08`: Deadline mới không hợp lệ. | Deadline/Priority mới được áp dụng; Hệ thống sắp xếp lại thứ tự ưu tiên trên danh sách công việc. |

#### 3.4.2. Member (Thành viên)

| # | Chức năng | Chi tiết logic chức năng | Kết quả mong đợi |
|:---|:---|:---|:---|
| **FR-01** | **Xem danh sách Task** | **Mô tả:** Truy cập danh sách công việc cá nhân hoặc của dự án.<br>**ĐK tiên quyết:** Là thành viên dự án.<br>**Luồng chính:** Hệ thống cung cấp các bộ lọc: "My Tasks", "Overdue", "Due Today".<br>**Quy tắc:** Member chỉ thấy Task trong các dự án mình được tham gia. | Hiển thị danh sách Task trực quan (List view/Board view). |
| **FR-03** | **Cập nhật Trạng thái** | **Mô tả:** Cập nhật tiến độ thực tế của công việc được giao.<br>**ĐK tiên quyết:** Là Assignee của Task.<br>**Luồng chính:** Thay đổi Status khi bắt đầu làm hoặc hoàn thành.<br>**Quy tắc:** Member không thể chuyển trạng thái các Task không được gán cho mình (trừ khi có quyền đặc biệt).<br>**Thông báo lỗi:** `ERR_TK_09`: Bạn không phải là người thực hiện Task này. | Status thay đổi; Hệ thống tự động ghi lại thời điểm hoàn thành (Completed Date). |
| **FR-04** | **Comment Task** | **Mô tả:** Thảo luận, trao đổi thông tin trực tiếp trên Task.<br>**ĐK tiên quyết:** Là thành viên dự án.<br>**Luồng chính:** 1. Nhập nội dung -> 2. @mention tên thành viên (nếu cần) -> 3. Lưu.<br>**Quy tắc:** Cho phép sửa/xóa comment cá nhân trong vòng 5 phút sau khi đăng. Mention phải gửi thông báo tức thì cho người được nhắc.<br>**Thông báo lỗi:** `ERR_TK_10`: Nội dung comment không được để trống. | Comment hiển thị theo thứ tự thời gian; Người được mention nhận thông báo Kafka. |
| **FR-05** | **Upload File** | **Mô tả:** Đính kèm tài liệu, hình ảnh liên quan đến công việc.<br>**ĐK tiên quyết:** Là thành viên dự án.<br>**Luồng chính:** 1. Chọn file/Kéo thả -> 2. Hệ thống kiểm tra dung lượng/định dạng -> 3. Lưu trữ (S3/File Server).<br>**Quy tắc:** Giới hạn dung lượng tối đa 20MB/file. Chỉ cho phép các định dạng phổ biến (doc, pdf, png, jpg, zip).<br>**Thông báo lỗi:** `ERR_TK_11`: File quá dung lượng; `ERR_TK_12`: Định dạng file bị cấm. | File được liệt kê trong phần "Attachments" của Task; Cho phép các thành viên khác tải về. |

#### 3.4.3. Đặc tả thành phần giao diện (UI Specification)

| ID | Chức năng | Các thành phần giao diện (UI Elements) | Hành động (Actions) |
|:---|:---|:---|:---|
| **UI-TK-01** | **Tạo/Cập nhật Task** | - **Modal/Drawer**: Ô nhập Tiêu đề, Trình soạn thảo văn bản (Mô tả).<br>- **Dropdown**: Priority (Màu sắc theo mức độ), Milestone, Assignee.<br>- **Date Picker**: Chọn hạn chót (Deadline). | - **Click "Lưu"**: Gửi request tạo/cập nhật.<br>- **Real-time**: Hiển thị Toast thông báo thành công cho những người liên quan. |
| **UI-TK-02** | **Bảng công việc (Board View)** | - **Kanban Board**: Các cột trạng thái (Todo, In Progress, Done...).<br>- **Task Card**: Tiêu đề, Avatar người thực hiện, Badge Priority, Icon Deadline (Đỏ nếu quá hạn). | - **Drag & Drop**: Kéo thả card giữa các cột để đổi trạng thái.<br>- **Click Card**: Mở Drawer chi tiết công việc. |
| **UI-TK-03** | **Chi tiết Task** | - Header: Tiêu đề và Trạng thái hiện tại.<br>- Body: Nội dung mô tả, danh sách Sub-tasks.<br>- Sidebar: Metadata (Assignee, Deadline, Priority, Milestone).<br>- Footer: Tab Thảo luận (Comments) và Tệp đính kèm. | - **Click "Sửa"**: Chuyển các field sang chế độ Edit.<br>- **Click "Xóa"**: Hiện popup xác nhận (Soft-delete). |
| **UI-TK-04** | **Thảo luận & Tệp đính kèm** | - **Comment Box**: Ô nhập nội dung, hỗ trợ @mention (Suggest list hiện ra khi gõ @).<br>- **Attachment Zone**: Vùng kéo thả file, danh sách file đã tải lên kèm icon định dạng. | - **Gõ nội dung + Enter**: Đăng bình luận.<br>- **Click File**: Tải về hoặc xem trước (nếu là ảnh). |
| **UI-TK-05** | **Lịch sử hoạt động (History)** | - Tab "Activity" trong chi tiết Task hiển thị dòng thời gian các thay đổi. | - **Xem**: Theo dõi ai đã đổi trạng thái hoặc chỉnh sửa deadline. |

#### 3.4.4. Thiết kế cơ sở dữ liệu (Database Mapping)

| Tên bảng (Table) | Chức năng liên quan | Các trường dữ liệu chính (Main Fields) | Ghi chú |
|:---|:---|:---|:---|
| **tasks** | UI-TK-01, 02, 03 | `id` (PK), `project_id` (FK), `milestone_id` (FK), `title`, `description`, `priority` (Enum), `status_id` (FK), `deadline`, `created_by`, `is_deleted`. | Bảng chính lưu thông tin task. `status_id` liên kết với bảng cấu hình workflow. |
| **task_assignees** | FR-06 | `id` (PK), `task_id` (FK), `user_id` (FK). | Quản lý quan hệ 1-n (Một task có thể có nhiều người thực hiện). |
| **task_comments** | FR-04 | `id` (PK), `task_id` (FK), `user_id` (FK), `content` (TEXT), `created_at`. | Lưu nội dung trao đổi. |
| **task_attachments** | FR-05 | `id` (PK), `task_id` (FK), `file_name`, `file_path`, `file_size`, `file_type`, `uploaded_by`. | Lưu thông tin tệp đính kèm (Path trỏ đến S3/File Server). |
| **task_history** | UI-TK-05 | `id` (PK), `task_id` (FK), `changed_by` (FK), `field_name`, `old_value`, `new_value`, `created_at`. | Lưu nhật ký thay đổi để phục vụ tính năng Tracking. |

### 3.5. User Module (Mọi vai trò)
#### 3.5.1. Quản lý tài khoản và Cá nhân hóa

| # | Chức năng | Chi tiết logic chức năng | Kết quả mong đợi |
|:---|:---|:---|:---|
| **FR-01** | **Đăng ký** | **Mô tả:** Tạo tài khoản mới để tham gia hệ thống.<br>**ĐK tiên quyết:** Email phải thuộc domain công ty (nếu có cấu hình) và chưa tồn tại trong hệ thống.<br>**Luồng chính:** 1. Nhập Họ tên, Email, Mật khẩu -> 2. Hệ thống mã hóa mật khẩu (BCrypt) -> 3. Lưu vào DB -> 4. Gửi mail xác nhận qua Kafka.<br>**Quy tắc:** Mật khẩu tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số. Email phải đúng định dạng.<br>**Thông báo lỗi:** `ERR_US_01`: Email đã tồn tại; `ERR_WS_02`: Mật khẩu không đủ độ mạnh. | Tài khoản được tạo ở trạng thái `Pending` (chờ xác nhận mail) hoặc `Active` tùy cấu hình. |
| **FR-02** | **Đăng nhập** | **Mô tả:** Xác thực danh tính để truy cập vào hệ thống.<br>**ĐK tiên quyết:** Tài khoản đã được kích hoạt.<br>**Luồng chính:** 1. Nhập Email/Password -> 2. Hệ thống kiểm tra thông tin xác thực -> 3. Tạo Access Token (JWT) -> 4. Trả về thông tin phiên làm việc.<br>**Quy tắc:** Khóa tài khoản tạm thời nếu nhập sai mật khẩu quá 5 lần. Token có thời hạn hết hạn nhất định.<br>**Thông báo lỗi:** `ERR_US_03`: Sai thông tin đăng nhập; `ERR_US_04`: Tài khoản đã bị khóa. | Đăng nhập thành công; User được điều hướng vào màn hình Dashboard chính; Token được lưu tại Client (Cookie/LocalStorage). |
| **FR-03** | **Đăng xuất** | **Mô tả:** Kết thúc phiên làm việc hiện tại.<br>**ĐK tiên quyết:** User đang trong trạng thái đăng nhập.<br>**Luồng chính:** 1. Chọn "Đăng xuất" -> 2. Hệ thống hủy Token trên phía Client -> 3. (Tùy chọn) Đưa Token vào Blacklist trong Redis.<br>**Quy tắc:** Đảm bảo mọi kết nối thời gian thực (Kafka/WebSocket) của User đó được ngắt hoàn toàn.<br>**Thông báo lỗi:** `ERR_US_05`: Lỗi khi kết thúc phiên làm việc. | User quay trở lại màn hình Đăng nhập; Không thể sử dụng Token cũ để truy cập API. |
| **FR-04** | **Cập nhật Profile** | **Mô tả:** Thay đổi thông tin cá nhân hiển thị trên hệ thống.<br>**ĐK tiên quyết:** User đã đăng nhập.<br>**Luồng chính:** 1. Vào trang Cá nhân -> 2. Sửa thông tin: Số điện thoại, Ảnh đại diện, Phòng ban -> 3. Nhấn "Lưu".<br>**Quy tắc:** Không được phép tự ý thay đổi Email (việc này thường qua quy trình xác minh riêng). Ảnh đại diện giới hạn < 5MB.<br>**Thông báo lỗi:** `ERR_US_06`: Định dạng ảnh không hỗ trợ; `ERR_US_07`: Số điện thoại không hợp lệ. | Thông tin cá nhân được cập nhật đồng bộ trên toàn hệ thống (Avatar trên các Task cũ cũng thay đổi theo). |
| **FR-05** | **Đổi mật khẩu** | **Mô tả:** Thay đổi thông tin bảo mật tài khoản.<br>**ĐK tiên quyết:** User nhớ mật khẩu hiện tại.<br>**Luồng chính:** 1. Nhập Mật khẩu cũ -> 2. Nhập Mật khẩu mới -> 3. Xác nhận mật khẩu mới -> 4. Hệ thống kiểm tra và cập nhật.<br>**Quy tắc:** Mật khẩu mới không được trùng với mật khẩu hiện tại. Sau khi đổi, yêu cầu đăng nhập lại trên tất cả thiết bị.<br>**Thông báo lỗi:** `ERR_US_08`: Mật khẩu cũ không chính xác; `ERR_US_09`: Mật khẩu mới không khớp với xác nhận. | Mật khẩu được cập nhật thành công; User nhận được email thông báo về việc thay đổi bảo mật. |
| **FR-06** | **Xem Task của tôi** | **Mô tả:** Tổng hợp toàn bộ công việc được gán cho cá nhân User đó.<br>**ĐK tiên quyết:** User đã đăng nhập.<br>**Luồng chính:** Truy cập mục "My Tasks". Hệ thống truy vấn tất cả các Task có `Assignee_ID = Current_User_ID`.<br>**Quy tắc:** Hiển thị danh sách tổng hợp từ tất cả các Workspace và Project mà User tham gia. Hỗ trợ sắp xếp theo Deadline gần nhất.<br>**Thông báo lỗi:** `ERR_US_10`: Lỗi tải danh sách công việc. | Hiển thị bảng tổng hợp công việc cá nhân, giúp User quản lý khối lượng công việc (Workload) hiệu quả. |

#### 3.5.3. Đặc tả thành phần giao diện (UI Specification)

| ID | Chức năng | Các thành phần giao diện (UI Elements) | Hành động (Actions) |
|:---|:---|:---|:---|
| **UI-US-01** | **Đăng ký / Đăng nhập** | - Form nhập liệu: Email, Mật khẩu, Họ tên.<br>- Nút "Đăng nhập", "Đăng ký".<br>- Checkbox "Ghi nhớ đăng nhập".<br>- Liên kết "Quên mật khẩu". | - **Click Login**: Validate định dạng email và mật khẩu trước khi gửi request.<br>- **Báo lỗi**: Hiển thị text đỏ dưới field nếu sai thông tin hoặc tài khoản bị khóa. |
| **UI-US-02** | **Cập nhật Profile** | - Màn hình Settings cá nhân.<br>- Thành phần Avatar: Hiển thị ảnh hiện tại và nút "Thay đổi ảnh".<br>- Form thông tin: Số điện thoại, Phòng ban, Chức danh. | - **Upload ảnh**: Chọn file từ máy tính, xem trước (preview) và cắt ảnh (crop) trước khi lưu.<br>- **Click "Lưu"**: Hiển thị Toast thông báo thành công. |
| **UI-US-03** | **Đổi mật khẩu** | - Form gồm 3 trường: Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới.<br>- Icon "Con mắt": Ẩn/Hiện mật khẩu. | - **Kiểm tra độ mạnh**: Hiển thị thanh tiến độ độ mạnh mật khẩu (Yếu/Trung bình/Mạnh) khi user gõ. |
| **UI-US-04** | **Xem Task của tôi (My Tasks)** | - Màn hình danh sách tổng hợp (List view).<br>- Bộ lọc (Filter): Theo Project, theo Deadline (Tuần này, Trễ hạn).<br>- Badge: Hiển thị số lượng Task đang mở trên menu sidebar. | - **Click Task**: Mở nhanh Drawer chi tiết Task để cập nhật trạng thái mà không cần chuyển trang. |
| **UI-US-05** | **Đăng xuất** | - Nút "Đăng xuất" trong menu thả xuống (Dropdown) tại Avatar góc phải màn hình. | - **Xác nhận**: Hiển thị Popup xác nhận "Bạn có chắc chắn muốn đăng xuất?". |

#### 3.5.3. Thiết kế cơ sở dữ liệu (Database Mapping)

| Tên bảng (Table) | Chức năng liên quan | Các trường dữ liệu chính (Main Fields) | Ghi chú |
|:---|:---|:---|:---|
| **users** | FR-01, FR-02, FR-03, FR-05 | `id` (PK), `email` (unique), `password_hash`, `status` (Active/Pending/Locked), `failed_attempt_count`, `last_login_at`, `created_at`. | Lưu thông tin xác thực cốt lõi. `password_hash` sử dụng thuật toán BCrypt. |
| **user_profiles** | FR-04 | `user_id` (FK), `full_name`, `avatar_url`, `phone_number`, `department_id` (FK), `position`. | Lưu thông tin cá nhân. Tách biệt với bảng `users` để tối ưu bảo mật và hiệu năng. |
| **token_blacklist** (Redis) | FR-03 | `token_jti`, `expired_at`. | Lưu trữ các JWT Token đã đăng xuất nhưng chưa hết hạn để ngăn chặn tái sử dụng. |
| **departments** | UI-US-02 | `id` (PK), `name`, `parent_id` (FK). | Bảng danh mục phòng ban liên kết với hệ thống HRM (S11). |

### 3.6. Report Module
#### 3.6.1. Admin (Hệ thống)

| # | Chức năng | Chi tiết logic chức năng | Kết quả mong đợi |
|:---|:---|:---|:---|
| **FR-01** | **Xem Dashboard hệ thống** | **Mô tả:** Theo dõi tổng quan toàn bộ hoạt động của công ty.<br>**ĐK tiên quyết:** Quyền Admin hệ thống.<br>**Luồng chính:** Hệ thống tổng hợp: Tổng số Workspace, Project đang chạy, tổng số User Active, biểu đồ tăng trưởng công việc theo tháng.<br>**Quy tắc:** Dữ liệu được cache qua Redis và cập nhật định kỳ (ví dụ 10 phút/lần) để tránh quá tải DB.<br>**Thông báo lỗi:** `ERR_RP_01`: Không thể tải dữ liệu Dashboard hệ thống. | Hiển thị các con số tổng quát và biểu đồ xu hướng trên toàn hệ thống. |
| **FR-02** | **Xem báo cáo Project** | **Mô tả:** Thống kê tiến độ của tất cả các dự án trong công ty.<br>**ĐK tiên quyết:** Quyền Admin hệ thống.<br>**Luồng chính:** 1. Chọn khoảng thời gian -> 2. Hệ thống xuất danh sách: % hoàn thành, số task trễ hạn, số dự án đúng tiến độ.<br>**Quy tắc:** Cho phép lọc theo Workspace hoặc Trạng thái dự án. Xuất được file Excel/PDF nếu cần.<br>**Thông báo lỗi:** `ERR_RP_02`: Lỗi xuất báo cáo dự án. | Bảng thống kê chi tiết tiến độ dự án hiển thị minh bạch cho cấp quản lý. |
| **FR-03** | **Xem báo cáo User** | **Mô tả:** Đánh giá hiệu suất làm việc của toàn bộ nhân sự.<br>**ĐK tiên quyết:** Quyền Admin hệ thống.<br>**Luồng chính:** Thống kê dựa trên: Số task được giao, số task hoàn thành đúng hạn, tỉ lệ task quá hạn của từng User.<br>**Quy tắc:** Dữ liệu được tính toán dựa trên lịch sử Activity Log và trạng thái Task.<br>**Thông báo lỗi:** `ERR_RP_03`: Dữ liệu người dùng không hợp lệ hoặc bị trống. | Bảng xếp hạng hiệu suất (Productivity) của nhân sự hiển thị rõ ràng. |

#### 3.6.2. Project Manager (Quản lý dự án)

| # | Chức năng | Chi tiết logic chức năng | Kết quả mong đợi |
|:---|:---|:---|:---|
| **FR-01** | **Xem báo cáo Project** | **Mô tả:** Theo dõi chi tiết "sức khỏe" dự án đang quản lý.<br>**ĐK tiên quyết:** Quyền Project Manager.<br>**Luồng chính:** Hiển thị biểu đồ Burn-down, tỉ lệ phân bổ task theo trạng thái (Todo/Doing/Done) và theo thành viên.<br>**Quy tắc:** Chỉ hiển thị dữ liệu của các dự án mà Manager đó được gán quyền quản lý.<br>**Thông báo lỗi:** `ERR_RP_04`: Bạn không có quyền xem báo cáo dự án này. | Biểu đồ trực quan giúp Manager đưa ra quyết định điều chỉnh nhân sự/thời gian kịp thời. |
| **FR-02** | **Xem báo cáo Milestone** | **Mô tả:** Theo dõi tiến độ theo từng giai đoạn (cột mốc).<br>**ĐK tiên quyết:** Quyền Project Manager.<br>**Luồng chính:** Hệ thống so sánh ngày dự kiến hoàn thành Milestone với ngày hoàn thành thực tế của các Task thuộc Milestone đó.<br>**Quy tắc:** Milestone được coi là "At Risk" nếu có > 20% task thuộc giai đoạn đó bị trễ hạn.<br>**Thông báo lỗi:** `ERR_RP_05`: Lỗi tính toán tiến độ giai đoạn. | Hiển thị danh sách các mốc thời gian kèm theo cảnh báo màu sắc (Xanh/Vàng/Đỏ). |
| **FR-03** | **Xem báo cáo User (Team)** | **Mô tả:** Đánh giá khối lượng công việc của các thành viên trong dự án.<br>**ĐK tiên quyết:** Quyền Project Manager.<br>**Luồng chính:** Hiển thị Workload của từng Member (số task đang làm).<br>**Quy tắc:** Giúp nhận diện thành viên đang quá tải (Overload) hoặc đang trống việc để điều phối lại.<br>**Thông báo lỗi:** `ERR_RP_06`: Không có dữ liệu thành viên trong dự án. | Biểu đồ cột thể hiện khối lượng công việc của từng cá nhân trong đội ngũ. |

#### 3.6.3. Member (Thành viên)

| # | Chức năng | Chi tiết logic chức năng | Kết quả mong đợi |
|:---|:---|:---|:---|
| **FR-01** | **Xem Dashboard cá nhân** | **Mô tả:** Tổng quan về hiệu suất cá nhân.<br>**ĐK tiên quyết:** Mọi người dùng đã đăng nhập.<br>**Luồng chính:** Hiển thị: Tổng số task đang mở, task đã hoàn thành trong tuần, tỉ lệ hoàn thành công việc cá nhân.<br>**Quy tắc:** Chỉ hiển thị dữ liệu cá nhân (My Task Analytics).<br>**Thông báo lỗi:** `ERR_RP_07`: Lỗi đồng bộ dữ liệu cá nhân. | Member nắm bắt được mình đã làm được bao nhiêu và còn tồn đọng bao nhiêu việc. |
| **FR-02** | **Xem Task gần Deadline** | **Mô tả:** Danh sách các việc cần ưu tiên xử lý ngay.<br>**ĐK tiên quyết:** Mọi người dùng.<br>**Luồng chính:** Lọc toàn bộ Task gán cho User có Deadline trong vòng 48 giờ tới.<br>**Quy tắc:** Tự động sắp xếp theo thứ tự ưu tiên (Priority) và thời gian gần nhất.<br>**Thông báo lỗi:** `ERR_RP_08`: Không có task nào sắp đến hạn. | Danh sách công việc khẩn cấp hiển thị ngay tại màn hình chính để Member xử lý. |
| **FR-03** | **Xem Task quá hạn** | **Mô tả:** Danh sách các việc đã vượt quá thời hạn cam kết.<br>**ĐK tiên quyết:** Mọi người dùng.<br>**Luồng chính:** Lọc các Task chưa ở trạng thái "Done" và có `Deadline < Current_Date`.<br>**Quy tắc:** Đánh dấu đỏ các Task quá hạn và gửi thông báo nhắc nhở mỗi sáng qua Kafka.<br>**Thông báo lỗi:** `ERR_RP_09`: Lỗi truy vấn dữ liệu quá hạn. | Member nhận diện rõ các "điểm đen" trong tiến độ cá nhân để có kế hoạch giải quyết. |

#### 3.6.4. Đặc tả thành phần giao diện (UI Specification)

Bảng này mô tả các yếu tố hiển thị trực quan và các tương tác báo cáo trên giao diện.

| ID | Chức năng | Các thành phần giao diện (UI Elements) | Hành động (Actions) |
|:---|:---|:---|:---|
| **UI-RP-01** | **Admin Dashboard** | - **Widgets**: Hiển thị tổng số Workspace, Project, User Active.<br>- **Chart (Line)**: Biểu đồ tăng trưởng Task theo tháng.<br>- **Table**: Danh sách Top 10 dự án có tiến độ tốt/tệ nhất. | - **Click Widget**: Chuyển hướng đến danh sách chi tiết.<br>- **Hover Chart**: Hiển thị Tooltip số liệu chi tiết tại điểm mốc thời gian. |
| **UI-RP-02** | **Project Report (PM)** | - **Chart (Doughnut)**: Tỷ lệ trạng thái Task (Todo, Doing, Done).<br>- **Chart (Burn-down)**: Đường lý thuyết vs Đường thực tế.<br>- **Filter**: Chọn Project, chọn khoảng thời gian (Date Range). | - **Click Export**: Xuất báo cáo sang Excel/PDF.<br>- **Toggle View**: Chuyển đổi giữa chế độ xem Biểu đồ và Bảng số liệu. |
| **UI-RP-03** | **User Workload (Team)** | - **Chart (Stacked Bar)**: Mỗi cột là 1 User, phân màu theo số Task (Done, In-progress, Overdue).<br>- **Tooltip**: Hiện tên User và số lượng công việc cụ thể. | - **Filter**: Lọc theo phòng ban hoặc vai trò trong dự án.<br>- **Click Bar**: Xem danh sách các Task của User đó. |
| **UI-RP-04** | **Milestone Health** | - **Status Timeline**: Danh sách các Milestone với màu cảnh báo (Xanh: On-track, Đỏ: At Risk).<br>- **Progress Bar**: Hiển thị % hoàn thành thực tế. | - **Click Milestone**: Mở Drawer danh sách các Task đang gây trễ hạn giai đoạn. |
| **UI-RP-05** | **Personal Dashboard** | - **Circular Progress**: % hoàn thành task cá nhân trong tuần.<br>- **List View**: Mục "Task khẩn cấp" và "Task quá hạn" được highlight màu đỏ. | - **Quick Action**: Click vào Task để cập nhật trạng thái trực tiếp từ Dashboard. |

#### 3.6.5. Thiết kế cơ sở dữ liệu (Database Mapping)

Để tối ưu hiệu năng cho báo cáo, hệ thống sử dụng kết hợp Views và Redis để giảm tải cho các bảng chính.

| Tên bảng/View | Chức năng liên quan | Các trường dữ liệu chính (Main Fields) | Ghi chú kỹ thuật |
|:---|:---|:---|:---|
| **v_project_summary** (View) | UI-RP-01, UI-RP-02 | `project_id`, `total_tasks`, `completed_tasks`, `overdue_tasks`, `completion_rate`. | View tổng hợp dữ liệu thời gian thực để tính toán tiến độ dự án. |
| **project_snapshots** | UI-RP-02 | `id` (PK), `project_id`, `snapshot_date`, `remaining_tasks`, `actual_hours`. | Lưu dữ liệu hàng ngày (Daily Job) để phục vụ vẽ biểu đồ Burn-down. |
| **user_productivity_logs** | UI-RP-03 | `user_id`, `project_id`, `date`, `tasks_completed`, `hours_logged`. | Lưu vết hiệu suất theo ngày để phục vụ báo cáo hiệu suất nhân sự. |
| **Redis Cache** (Keys) | FR-01 (Admin) | `stats:system:global`, `stats:workspace:{id}`. | Lưu trữ kết quả tính toán Dashboard với thời gian sống (TTL) 10 phút. |

### 3.7. Tracking Module
#### 3.7.1. Project Manager (Quản lý dự án)

| # | Chức năng | Chi tiết logic chức năng | Kết quả mong đợi |
|:---|:---|:---|:---|
| **FR-01** | **Xem Activity Log Project** | **Mô tả:** Theo dõi toàn bộ các biến động dữ liệu trong phạm vi dự án.<br>**ĐK tiên quyết:** Quyền Project Manager.<br>**Luồng chính:** 1. Truy cập tab "Activity Log" -> 2. Chọn bộ lọc (Thành viên, Loại thao tác, Thời gian) -> 3. Hệ thống truy vấn từ bảng Audit Log.<br>**Quy tắc:** Log phải ghi rõ: Ai làm, Làm lúc nào, Thao tác gì (Tạo/Sửa/Xóa), Giá trị cũ và Giá trị mới.<br>**Thông báo lỗi:** `ERR_TR_01`: Lỗi truy xuất nhật ký hoạt động. | Danh sách các hoạt động hiển thị theo thứ tự thời gian mới nhất lên đầu. |
| **FR-02** | **Xem lịch sử Task** | **Mô tả:** Truy xuất chi tiết các thay đổi của một Task cụ thể từ lúc khởi tạo.<br>**ĐK tiên quyết:** Quyền Project Manager hoặc Member thuộc dự án.<br>**Luồng chính:** 1. Mở chi tiết Task -> 2. Chọn tab "History" -> 3. Xem danh sách thay đổi.<br>**Quy tắc:** Ghi lại mọi thay đổi về Assignee, Status, Deadline và nội dung mô tả.<br>**Thông báo lỗi:** `ERR_TR_02`: Không có dữ liệu lịch sử cho công việc này. | Hiển thị dòng thời gian (Timeline) thay đổi của Task minh bạch. |
| **FR-03** | **Theo dõi tiến độ Task** | **Mô tả:** Giám sát trạng thái thực hiện các Task theo thời gian thực.<br>**ĐK tiên quyết:** Quyền Project Manager.<br>**Luồng chính:** Hệ thống tổng hợp dữ liệu từ các Task: % hoàn thành, thời gian thực tế so với thời gian dự kiến.<br>**Quy tắc:** Tự động cảnh báo (đổi màu) đối với các Task có tiến độ thực tế chậm hơn kế hoạch.<br>**Thông báo lỗi:** `ERR_TR_03`: Lỗi tính toán tiến độ công việc. | Biểu đồ hoặc bảng danh sách hiển thị rõ ràng các Task đang "Healthy" hoặc "At Risk". |
| **FR-04** | **Xem Time Tracking** | **Mô tả:** Thống kê tổng số giờ làm việc của các thành viên trên từng đầu việc.<br>**ĐK tiên quyết:** Quyền Project Manager.<br>**Luồng chính:** Hệ thống cộng dồn dữ liệu từ tính năng Timer của các Member -> Xuất báo cáo Timesheet.<br>**Quy tắc:** Cho phép xem tổng giờ theo từng Member hoặc theo từng Task trong dự án.<br>**Thông báo lỗi:** `ERR_TR_04`: Dữ liệu thời gian bị trống hoặc chưa được ghi nhận. | Báo cáo chi tiết số giờ làm việc (Billable/Non-billable hours) hiển thị chính xác. |

#### 3.7.2. Member (Thành viên)

| # | Chức năng | Chi tiết logic chức năng | Kết quả mong đợi |
|:---|:---|:---|:---|
| **FR-01** | **Xem Activity Log** | **Mô tả:** Theo dõi các hoạt động liên quan trực tiếp đến cá nhân hoặc các Task mình tham gia.<br>**ĐK tiên quyết:** Member đã đăng nhập.<br>**Luồng chính:** Hệ thống lọc Audit Log theo `User_ID` hoặc `Task_Assignee_ID`.<br>**Quy tắc:** Member không được xem log của các Project/Task mà mình không tham gia.<br>**Thông báo lỗi:** `ERR_TR_05`: Bạn không có quyền xem nhật ký này. | Hiển thị danh sách các hoạt động Member đã thực hiện hoặc các thay đổi Member cần chú ý. |
| **FR-03** | **Start/Stop Time Tracking** | **Mô tả:** Ghi nhận thời gian thực hiện một công việc cụ thể (Timer).<br>**ĐK tiên quyết:** User được Assign vào Task đó.<br>**Luồng chính:** 1. Click "Start" (Timer bắt đầu chạy) -> 2. Click "Stop" (Hệ thống tính toán thời gian chênh lệch) -> 3. Lưu vào DB.<br>**Quy tắc:** Tại một thời điểm, User chỉ được chạy 01 Timer duy nhất. Nếu Start Task mới, Task cũ tự động Stop.<br>**Thông báo lỗi:** `ERR_TR_06`: Task đã hoàn thành, không thể ghi nhận thời gian. | Thời gian làm việc được ghi nhận chính xác đến từng giây vào hệ thống Timesheet. |
| **FR-05** | **Nhận Notification** | **Mô tả:** Nhận thông báo tức thời khi có thay đổi liên quan.<br>**ĐK tiên quyết:** Có kết nối Internet/WebSocket ổn định.<br>**Luồng chính:** 1. Sự kiện xảy ra (Assign task, Comment...) -> 2. Kafka đẩy message -> 3. Frontend hiển thị Pop-up/Chuông báo.<br>**Quy tắc:** Thông báo phải được gửi đúng đối tượng liên quan (Assignee, Follower).<br>**Thông báo lỗi:** `ERR_TR_07`: Lỗi kết nối dịch vụ thông báo thời gian thực. | Thông báo hiển thị ngay lập tức trên màn hình mà không cần load lại trang. |
| **FR-06** | **Xem Notification** | **Mô tả:** Truy cập danh sách các thông báo đã nhận.<br>**ĐK tiên quyết:** Mọi người dùng.<br>**Luồng chính:** Click vào biểu tượng "Chuông" để xem danh sách thu gọn hoặc màn hình "All Notifications" để xem đầy đủ.<br>**Quy tắc:** Phân loại thông báo: Hệ thống, Dự án, Nhắc hẹn Deadline.<br>**Thông báo lỗi:** `ERR_TR_08`: Không có thông báo nào. | Danh sách thông báo hiển thị theo thứ tự thời gian; làm nổi bật các thông báo chưa đọc. |
| **FR-07** | **Đánh dấu đã đọc** | **Mô tả:** Cập nhật trạng thái của thông báo để theo dõi.<br>**ĐK tiên quyết:** Có thông báo chưa đọc (Unread).<br>**Luồng chính:** 1. Click vào thông báo hoặc chọn "Mark all as read" -> 2. Hệ thống cập nhật `is_read = true`.<br>**Quy tắc:** Giảm số đếm (Counter) trên icon chuông báo ngay lập tức.<br>**Thông báo lỗi:** `ERR_TR_09`: Lỗi cập nhật trạng thái thông báo. | Trạng thái thông báo thay đổi; số đếm thông báo chưa đọc được cập nhật lại. |

#### 3.7.3. Đặc tả thành phần giao diện (UI Specification)

Bảng này mô tả các thành phần giao diện phục vụ cho việc theo dõi log, lịch sử và thông báo.

| ID | Chức năng | Các thành phần giao diện (UI Elements) | Hành động (Actions) |
|:---|:---|:---|:---|
| **UI-TR-01** | **Bảng nhật ký (Activity Log)** | - **Filter bar**: Bộ lọc theo Thành viên, Loại hành động (Create/Update/Delete), Thời gian.<br>- **Data Table**: Danh sách các dòng log kèm mô tả chi tiết nội dung thay đổi. | - **Click Filter**: Áp dụng bộ lọc để tìm kiếm log nhanh.<br>- **Scroll**: Lazy loading để tải thêm lịch sử log cũ hơn. |
| **UI-TR-02** | **Lịch sử Task (Timeline)** | - **Vertical Timeline**: Dòng thời gian thẳng đứng bên trong tab History của Task.<br>- **Log Item**: Hiển thị Avatar, tên người đổi và so sánh giá trị "Cũ" -> "Mới". | - **Hover**: Hiển thị chi tiết thời gian chính xác (giây/phút). |
| **UI-TR-03** | **Bộ đếm thời gian (Timer)** | - **Floating Widget** hoặc **Button** trong Task: Nút Play/Stop.<br>- **Timer Display**: Hiển thị số giờ:phút:giây đang trôi qua.<br>- **Tooltip**: Hiện thông báo "Đang ghi nhận thời gian cho Task X". | - **Click Start**: Biểu tượng chuyển sang Stop, số bắt đầu chạy.<br>- **Click Stop**: Dừng ghi nhận, hiện popup xác nhận lưu thời gian làm việc. |
| **UI-TR-04** | **Trung tâm thông báo** | - **Bell Icon**: Biểu tượng chuông với Badge đỏ (số lượng thông báo chưa đọc).<br>- **Notification Dropdown**: Danh sách 5-10 thông báo mới nhất.<br>- **Full Screen List**: Trang danh sách toàn bộ thông báo. | - **Click Chuông**: Mở nhanh danh sách thông báo.<br>- **Click "Đánh dấu đã đọc"**: Xóa badge đỏ và cập nhật trạng thái hiển thị. |

#### 3.7.4. Thiết kế cơ sở dữ liệu (Database Mapping)

Module này sử dụng kết hợp PostgreSQL để lưu trữ lịch sử lâu dài và Redis để quản lý các trạng thái thời gian thực (Timer).

| Tên bảng (Table) | Chức năng liên quan | Các trường dữ liệu chính (Main Fields) | Ghi chú kỹ thuật |
|:---|:---|:---|:---|
| **audit_logs** | FR-01, FR-02 | `id` (PK), `project_id` (FK), `task_id` (FK), `user_id` (FK), `action_type`, `old_value` (JSON), `new_value` (JSON), `created_at`. | Lưu trữ mọi thay đổi dữ liệu. Sử dụng kiểu JSON để linh hoạt lưu vết các trường khác nhau. |
| **time_trackings** | FR-03, FR-04 | `id` (PK), `user_id` (FK), `task_id` (FK), `start_time`, `end_time`, `duration` (seconds). | Lưu trữ các phiên làm việc của Member trên từng Task. |
| **notifications** | FR-05, 06, 07 | `id` (PK), `user_id` (FK), `title`, `content`, `type` (System/Project), `link_url`, `is_read` (Boolean), `created_at`. | Lưu trữ thông báo gửi cho từng User. |
| **Active Timers** (Redis) | FR-03 | `key: timer:user:{id}`, `value: {task_id, start_at}`. | Lưu trạng thái Timer đang chạy để tránh việc User chạy nhiều Timer cùng lúc và đảm bảo hiệu năng. |
---
## 4. Yêu cầu phi chức năng (Non-functional requirements)
Phần này xác định các tiêu chuẩn chất lượng mà hệ thống CTEL PM phải đạt được để đảm bảo vận hành ổn định, an toàn và mang lại trải nghiệm tốt nhất cho người dùng.

### 4.1. Hiệu năng (Performance)

| ID | Yêu cầu | Chi tiết đặc tả & Tiêu chuẩn kỹ thuật | Phương pháp kiểm chứng |
|:---|:---|:---|:---|
| **NFR-01** | **Thời gian phản hồi** | - 95% các yêu cầu HTTP (API) thông thường phải phản hồi trong ≤ 1.5 giây.<br>- Các thao tác nghiệp vụ phức tạp (ghi dữ liệu) không quá 2 giây. | Sử dụng công cụ JMeter hoặc Postman để đo độ trễ API (Latency). |
| **NFR-02** | **Tải dữ liệu danh sách** | - Áp dụng Pagination (phân trang) mặc định 20 bản ghi/trang.<br>- Sử dụng **Redis Cache** cho các danh mục dùng chung để đảm bảo tốc độ load ≤ 3 giây. | Kiểm tra thời gian Load Page trên trình duyệt (Network tab). |
| **NFR-03** | **Khả năng chịu tải** | - Hệ thống hỗ trợ 500 - 1000 người dùng truy cập đồng thời mà không làm tăng tỷ lệ lỗi quá 1%.<br>- Thiết kế Stateless để có thể Auto-scaling khi cần. | Thực hiện Stress Test/Load Test với kịch bản giả lập số lượng user lớn. |
| **NFR-04** | **Đồng bộ Real-time** | - Thông báo đẩy và cập nhật trạng thái qua **Kafka** phải hiển thị trên UI trong vòng ≤ 1 giây kể từ khi sự kiện phát sinh. | Đo độ trễ giữa hành động của User A và sự thay đổi trên màn hình User B. |

### 4.2. Bảo mật (Security)

| ID | Yêu cầu | Chi tiết đặc tả & Tiêu chuẩn kỹ thuật | Phương pháp kiểm chứng |
|:---|:---|:---|:---|
| **NFR-05** | **Xác thực & Ủy quyền** | - Sử dụng **JWT (JSON Web Token)** kết hợp với **Spring Security**.<br>- Phân quyền chặt chẽ theo mô hình RBAC (Role-Based Access Control). | Truy cập API trái phép để kiểm tra lỗi 401 (Unauthorized) và 403 (Forbidden). |
| **NFR-06** | **Mã hóa dữ liệu** | - Mật khẩu bắt buộc băm bằng **BCrypt** (Cost factor 12).<br>- Toàn bộ giao tiếp giữa Client và Server phải qua giao thức **HTTPS (TLS 1.2+)**. | Kiểm tra trực tiếp Database (DB) và sử dụng Wireshark để kiểm tra dữ liệu truyền đi. |
| **NFR-07** | **Quản lý phiên (Session)** | - Token có thời gian hết hạn (TTL). Cơ chế Refresh Token được áp dụng.<br>- Tự động thu hồi quyền truy cập khi User đăng xuất thông qua Redis Blacklist. | Kiểm tra tính hiệu lực của Token sau khi đăng xuất hoặc hết hạn. |
| **NFR-08** | **Audit Log & Bảo vệ** | - Ghi nhật ký mọi hành động CUD (Create/Update/Delete).<br>- Ngăn chặn các lỗi bảo mật phổ biến như SQL Injection, XSS, CSRF. | Sử dụng công cụ quét lỗ hổng bảo mật (Snyk, OWASP ZAP). |

### 4.3. Khả năng sử dụng (Usability)

| ID | Yêu cầu | Chi tiết đặc tả & Tiêu chuẩn kỹ thuật | Phương pháp kiểm chứng |
|:---|:---|:---|:---|
| **NFR-09** | **Thiết kế Giao diện** | - Tuân thủ bộ Design System đồng nhất (Ant Design/Material UI).<br>- Font chữ hệ thống không dưới 14px, độ tương phản màu sắc đạt chuẩn WCAG 2.1. | Đánh giá trực tiếp qua bản thiết kế Figma và UI thực tế. |
| **NFR-10** | **Điều hướng (Navigation)** | - Áp dụng quy tắc "3-click": Người dùng tìm thấy thông tin cần thiết trong tối đa 3 lần nhấn chuột. | Thực hiện User Acceptance Testing (UAT) với người dùng thực tế. |
| **NFR-11** | **Khả năng hiển thị** | - Tương thích tốt trên Desktop (1920x1080) và Tablet (768px trở lên).<br>- Hiển thị ổn định trên các trình duyệt hiện đại (Chrome, Edge, Safari). | Kiểm tra chế độ Responsive trên trình duyệt và thiết bị vật lý. |
| **NFR-12** | **Thông báo & Chỉ dẫn** | - Các lỗi nghiệp vụ phải hiển thị bằng tiếng Việt, rõ ràng, có mã lỗi đi kèm (Error Code). | Thực hiện các kịch bản gây lỗi để kiểm tra thông báo Toast/Modal. |

### 4.4. Độ tin cậy (Reliability)

| ID | Yêu cầu | Chi tiết đặc tả & Tiêu chuẩn kỹ thuật | Phương pháp kiểm chứng |
|:---|:---|:---|:---|
| **NFR-13** | **Tính ổn định (Uptime)** | - Cam kết hệ thống hoạt động ổn định với chỉ số SLA ≥ 99.9%.<br>- Tự động khởi động lại (Self-healing) nếu một Service gặp sự cố. | Theo dõi chỉ số Uptime thông qua công cụ giám sát. |
| **NFR-14** | **Sao lưu & Khôi phục** | - **RPO (Dữ liệu mất tối đa):** 24 giờ. Backup Database tự động hàng ngày.<br>- **RTO (Thời gian phục hồi):** ≤ 4 giờ sau khi xảy ra sự cố nghiêm trọng. | Thử nghiệm khôi phục dữ liệu từ bản Backup định kỳ hàng quý. |
| **NFR-15** | **Xử lý lỗi (Graceful)** | - Hệ thống không hiển thị màn hình trắng hoặc Code lỗi cho người dùng cuối. Luôn có trang lỗi (404/500) thân thiện. | Tắt thử nghiệm một Service phụ và kiểm tra phản hồi của hệ thống. |

### 4.5. Giám sát & Nhật ký (Logging & Monitoring)

| ID | Yêu cầu | Chi tiết đặc tả & Tiêu chuẩn kỹ thuật | Phương pháp kiểm chứng |
|:---|:---|:---|:---|
| **NFR-16** | **Hệ thống Nhật ký** | - Ghi Log tập trung bằng SLF4J/Logback. Phân loại mức độ: INFO, WARN, ERROR.<br>- Tự động xoay vòng Log (Log Rotation) để tối ưu không gian ổ cứng. | Kiểm tra các file log trực tiếp trên máy chủ ứng dụng. |
| **NFR-17** | **Giám sát (Monitoring)** | - Sử dụng **Prometheus** và **Grafana** để theo dõi các chỉ số: CPU, RAM, JVM Heap, Kafka Lag và DB Connection Pool. | Theo dõi các Dashboard giám sát thực tế trong quá trình vận hành. |
| **NFR-18** | **Cảnh báo (Alerting)** | - Tự động gửi thông báo (Telegram/Email/Slack) khi hệ thống gặp lỗi 5xx hoặc quá tải Server kéo dài quá 5 phút. | Giả lập tình trạng quá tải và kiểm tra việc nhận thông báo cảnh báo. |
