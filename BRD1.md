# Tài liệu Yêu cầu Nghiệp vụ (BRD)
l# Nền tảng Quản lý Dự án & Công việc Nội bộ — CTEL PM

> **Phiên bản:** 1.0
> **Ngày tạo:** 18/03/2026
> **Tác giả:** Tuan Anh, Tuan Minh
> **Trạng thái:** Draft
> **Phân loại:** Nội bộ — Bảo mật

---

## Lịch sử phiên bản

| Phiên bản | Ngày | Người chỉnh sửa | Mô tả thay đổi |
|-----------|------|-----------------|-----------------|
| 1.0 | 18/03/2026 | Lead | Phiên bản khởi tạo |

## Mục lục

1. [Tổng quan tài liệu](#1-tổng-quan-tài-liệu)
2. [Bối cảnh kinh doanh](#2-bối-cảnh-kinh-doanh)
3. [Mục tiêu kinh doanh](#3-mục-tiêu-kinh-doanh)
4. [Phạm vi](#4-phạm-vi)
5. [Các bên liên quan](#5-các-bên-liên-quan)
6. [Yêu cầu nghiệp vụ](#6-yêu-cầu-nghiệp-vụ)
7. [Quy tắc nghiệp vụ](#7-quy-tắc-nghiệp-vụ)
8. [Use-case tổng quan](#8-use-case-tổng-quan)
9. [Ràng buộc & Giả định](#9-ràng-buộc--giả-định)
10. [Phân tích rủi ro](#10-phân-tích-rủi-ro)
11. [Tiêu chí chấp nhận & Đo lường thành công](#11-tiêu-chí-chấp-nhận--đo-lường-thành-công)
12. [Lộ trình triển khai](#12-lộ-trình-triển-khai)
13. [Phụ lục](#13-phụ-lục)

---

## 1. Tổng quan tài liệu

### 1.1. Mục đích

Tài liệu Yêu cầu Nghiệp vụ (Business Requirements Document — BRD) này mô tả các yêu cầu nghiệp vụ cho việc xây dựng **Nền tảng Quản lý Dự án & Công việc Nội bộ (CTEL PM)** dành cho doanh nghiệp viễn thông CTEL. Tài liệu là cơ sở để các bên liên quan thống nhất về phạm vi, mục tiêu, và kỳ vọng trước khi tiến hành thiết kế kỹ thuật và triển khai.

### 1.2. Đối tượng đọc

- Anh nam Dev lead

### 1.3. Tài liệu tham chiếu

| Mã | Tài liệu | Phiên bản |
|----|----------|-----------|
| REF-01 | Tài liệu BRD | 1.0


### 1.4. Thuật ngữ & Viết tắt

| Viết tắt | Giải nghĩa |
|----------|------------|
| PM | Project Management |
| BRD | Business Requirements Document |
| BPMN | Business Process Model and Notation |
| CRM | Customer Relationship Management |
| HRM | Human Resource Management |
| NMS | Network Management System |
| DMS | Document Management System |
| SLA | Service Level Agreement |
| ARPU | Average Revenue Per User |
| SSO | Single Sign-On |
| RBAC | Role-Based Access Control |
| MVP | Minimum Viable Product |

---

## 2. Bối cảnh kinh doanh

### 2.1. Hiện trạng



### 2.2. Vấn đề cần giải quyết

| # | Vấn đề | Tác động |
|---|--------|---------|
| P1 | Các đơn vị quản lý công việc bằng công cụ rời rạc (Excel, email, chat, file chia sẻ) | Mất đồng bộ thông tin, không truy vết được |
| P2 | Không có visibility xuyên suốt về tiến độ, hiệu suất, nguồn lực | Quản lý phản ứng thay vì chủ động |
| P3 | Dữ liệu quản lý công việc tách rời khỏi dữ liệu nghiệp vụ đã centralization | Lãng phí giá trị dữ liệu, thiếu ngữ cảnh |
| P4 | Thiếu khả năng đánh giá hiệu suất dựa trên dữ liệu thực tế | Đánh giá chủ quan, không công bằng |
| P5 | Sử dụng PM tool bên ngoài gây rủi ro data sovereignty | Vi phạm chính sách bảo mật, data governance |

### 2.3. Lý do tự xây dựng thay vì mua giải pháp thương mại

| Tiêu chí | Mua PM Tool (SaaS) | Tự xây dựng (CTEL PM) |
|----------|---------------------|------------------------|
| **Kiểm soát dữ liệu** | Dữ liệu trên cloud bên thứ ba; rủi ro data residency | Dữ liệu 100% trên Data Platform nội bộ |
| **Liên kết phân hệ** | API/webhook mỏng, bất đồng bộ | Truy cập trực tiếp, entity-level, real-time |
| **Tùy chỉnh workflow** | Phụ thuộc vendor; giới hạn cấu hình | Tận dụng BPMN Engine; tùy chỉnh không giới hạn |
| **Chi phí dài hạn** | Subscription tăng theo user; tích lũy lớn | Đầu tư ban đầu cao; chi phí biên thấp khi scale |
| **Đặc thù Telco** | Thiết kế chung, không hiểu domain | Entity model phù hợp chính xác domain Telco |

---

## 3. Mục tiêu kinh doanh

### 3.1. Mục tiêu chiến lược (SMART)

| ID | Mục tiêu | Cụ thể (S) | Đo lường (M) | Khả thi (A) | Liên quan (R) | Thời hạn (T) |
|----|---------|-------------|---------------|-------------|---------------|---------------|
| OBJ-01 | **Thống nhất quản lý công việc** | Tất cả đơn vị sử dụng chung 1 nền tảng PM | ≥70% adoption rate | Pilot từ 2 team, mở rộng dần | Giải quyết P1, P2 |  |
| OBJ-02 | **Kiểm soát dữ liệu nội bộ** | Toàn bộ dữ liệu PM nằm trên Data Platform | 100% data residency nội bộ | Tận dụng Data Platform hiện có | Giải quyết P5 |  |
| OBJ-03 | **Liên kết dữ liệu xuyên phân hệ** | Mọi entity PM liên kết được với entity nghiệp vụ | ≥5 related items TB / project | Relation Engine + Connectors | Giải quyết P3 |  |
| OBJ-04 | **Đo lường hiệu suất** | Cung cấp metrics tự động cho cá nhân, team, project | Dashboard realtime + báo cáo định kỳ | Dữ liệu từ hệ thống, tính toán tự động | Giải quyết P4 |  |

---

## 4. Phạm vi

### 4.1. Trong phạm vi (In-Scope)

| # | Hạng mục | Mô tả |
|---|---------|-------|
| S1 | Quản lý dự án & công việc | Workspace, Project, Task, Sub-task, Checklist — CRUD đầy đủ |
| S2 | Cấu trúc phân cấp linh hoạt | Workspace → Project → Phase/Sprint → Task → Sub-task → Checklist Item |
| S3 | Đa chế độ hiển thị | Kanban, List, Gantt/Timeline, Calendar, Workload |
| S4 | Trạng thái cấu hình được | Mỗi project type có bộ status flow riêng, quản lý bởi BPMN |
| S5 | Relation Engine | Liên kết entity PM ↔ entity nghiệp vụ, 20+ relation types, truy vấn hai chiều |
| S6 | Quản lý tiến độ | Milestone tracking, Sprint tracking, Dashboard tiến độ đa cấp |
| S7 | Quản lý hiệu suất | Metrics cá nhân, team, project; báo cáo tự động |
| S8 | Cộng tác | Comment, Activity feed, Notification đa kênh, Watcher |
| S9 | Tích hợp BPMN | Status transition → BPMN process, Approval flow, Escalation |
| S10 | System Connectors | Tích hợp CRM, Billing, HRM, Ticketing, Finance, NMS, Procurement, DMS, Service Catalog |
| S11 | Unified Search | Tìm kiếm entity xuyên phân hệ từ search bar duy nhất |
| S12 | Global Dashboard | Dashboard tổng hợp dữ liệu xuyên suốt cho quản lý cấp cao |
| S13 | Related Items Panel | UI hiển thị liên kết entity trên giao diện chi tiết task/project |

### 4.2. Ngoài phạm vi (Out-of-Scope)

| # | Hạng mục | Lý do |
|---|---------|-------|
| O1 | Xây dựng Data Platform mới | Đã có sẵn, chỉ mở rộng schema |
| O2 | Xây dựng BPMN Engine mới | Đã có sẵn, chỉ tích hợp |
| O3 | Xây dựng hệ thống Auth/SSO mới | Đã có sẵn, chỉ tích hợp |
| O4 | AI & Intelligence (Phase 4) | Sẽ bổ sung sau  |
| O5 | Gợi ý Related Items thông minh (NLP) | Thuộc Phase 4 tương lai |
| O6 | Mobile native app | Web responsive đủ cho MVP; mobile native nếu có nhu cầu sau |
| O7 | Tích hợp tool bên ngoài (Slack, Teams, Jira) | Không cần thiết khi có nền tảng nội bộ |
| O8 | Quản lý tài chính chi tiết (accounting) | Thuộc hệ thống Finance, PM chỉ link budget |

---

## 5. Các bên liên quan

### 5.1. Danh sách Stakeholders

| Stakeholder | Vai trò | Mối quan tâm chính |
|------------|---------|---------------------|
| **CTO / CIO** | Sponsor, phê duyệt ngân sách & chiến lược | ROI, data sovereignty, tích hợp hệ sinh thái |
| **COO** | Người dùng cấp cao | Visibility tiến độ toàn tổ chức, hiệu suất |
| **Trưởng phòng CNTT** | Quản lý triển khai kỹ thuật | Kiến trúc, bảo mật, vận hành |
| **Đội Dev (PM & thành viên)** | Người dùng chính — nhóm dev | Sprint, task management, code review flow |
| **Đội Customer Care** | Người dùng chính — chăm sóc KH | Chương trình loyalty, liên kết CRM |
| **Đội Back-office (HR/Admin)** | Người dùng chính — sự kiện nội bộ | Tổ chức sự kiện, liên kết HRM/Finance |
| **Đội Network Ops** | Người dùng chính — vận hành mạng | Bảo trì/nâng cấp, liên kết NMS |
| **Đội Service Delivery** | Người dùng chính — triển khai B2B | Triển khai dịch vụ, liên kết Contract/Billing |
| **Đội Data Platform** | Hỗ trợ kỹ thuật | Schema extension, data governance |
| **Đội BPMN Engine** | Hỗ trợ kỹ thuật | Process definition, workflow integration |
| **Đội QA** | Kiểm thử | Chất lượng, test coverage |
| **UX Designer** | Thiết kế trải nghiệm | Usability, adoption |

---

## 6. Yêu cầu nghiệp vụ
### 6.1. Quản lý dự án và công việc

| ID | Tên yêu cầu | Mô tả | Ưu tiên | Tiêu chí chấp nhận |
|----|-------------|-------|---------|--------------------|
| **BR-01** | Cấu trúc phân cấp | Hệ thống phải hỗ trợ cấu trúc: Workspace → Project → Milestone → Task → Sub-task → Comment. | Must | - Tạo được từng cấp- Điều hướng giữa các cấp- URL riêng cho từng entity |
| **BR-02** | Quản lý Workspace | Tạo, sửa, xóa workspace và quản lý thành viên. | Must | - CRUD workspace-Thêm/xóa member-Phân quyền |
| **BR-03** | Quản lý Project | Tạo, sửa, xóa project trong workspace. | Must | - CRUD project- Gán member- Hiển thị danh sách |
| **BR-04** | Quản lý Milestone | Tạo milestone để xác định mốc công việc. | Must | - Tạo milestone- Gán deadline |
| **BR--05** | Quản lý Task | Task là đơn vị chính, gồm title, description, assignee, status, priority. | Must | - CRUD task- Assign user- Update status |
| **BR-06** | Trạng thái Task | Hỗ trợ trạng thái To-do, In Progress, Done. | Must | - Chuyển trạng thái- Hiển thị đúng |
| **BR-07** | Sub-task | Task có thể chia thành sub-task. | Must | - Tạo subtask- Link với task cha |
| **BR-08**| Checklist | Task hỗ trợ checklist nhỏ. | Should | - Tạo checklist item- Tick hoàn thành |
| **BR-09** | Comment | Comment trực tiếp trên task. | Must | - Thêm/xóa comment- Hiển thị lịch sử |

### 6.2. Quản lý Người dùng & Phân quyền 
| ID | Tên yêu cầu | Mô tả | Ưu tiên | Tiêu chí chấp nhận |
|----|-------------|-------|---------|--------------------|
| **BR-010** | Quản lý User  | Admin quản lý user hệ thống. | Must | - Tạo/Sửa/Xóa User |
| **BR-011** | Role & Permission | Hệ thống phân quyền theo role. | Must | - Role: Admin, Owner, Manager, Member, Guest- Kiểm tra |
| **BR-012** | Phân quyền Workspace | Phân quyền theo workspace. | Must | - Gắn role trong workspace- Kiểm soát truy cập |
| **BR-013** | Phân quyền Project | Phân quyền theo project | Must | - Member chỉ thấy project dược gán | 
| **BR-014** | Gán nhiều user | Task có thể assign nhiều người | Should | - Add nhiều assignee |

### 6.3. Xác thực & bảo mật
| ID | Tên yêu cầu | Mô tả | Ưu tiên | Tiêu chí chấp nhận |
|----|-------------|-------|---------|--------------------|
| **BR-015** | Đăng ký | Người dùng tạo tài khoản | Must | - Nhập email/password- Validate |
| **BR-016** | Đăng nhập | Người dùng đăng nhập hệ thống | Must | - Login thành công- Token/sesion |
| **BR-017** | Đăng xuất | Người dùng logout | Must | - Clear session |
| **BR-018** | Bảo mật | Hệ thống đảm bảo an thống đảm bảo an toàn dữ liệu | Must | - Password mã hóa- Kiểm soát truy cập |

### 6.4. Cộng tác & Giao tiếp 
| ID | Tên yêu cầu | Mô tả | Ưu tiên | Tiêu chí chấp nhận |
|----|-------------|-------|---------|--------------------|
| **BR-019** | Comment nâng cao | Comment hỗ trợ mention user. | Should | - @user- Highlight | 
| **BR-020** | Thông báo cơ bản  | Hiển thị thông báo khi có thay đổi. | Should | - Khi assign task- Khi có comment |
| **BR-021** | Lịch sử hoạt động | Lưu log hành động. | Should | - Hiển thị activity log |

### 6.5. Theo dõi & Báo cáo 
| ID | Tên yêu cầu | Mo tả | Ưu tiên | Tiêu chí chấp nhận |
|----|-------------|-------|---------|--------------------|
| **BR-022** | Theo dõi tiến độ | Hiển thị % hoàn thành project | Should | Tính từ task |
| **BR-023** | Dashboard | Hiển thị tổng quan project | Could | Task theo status |
| **BR-024** | Lọc & tìm kiếm | Tìm kiếm task | Should | - Search theo tên- Filter theo status |

### 6.6. Mở rộng & Tùy chỉnh 
| ID | Tên yêu cầu | Mô tả | Ưu tiên | Tiêu chí chấp nhận |
|----|-------------|-------|---------|--------------------|
| **BR-025** | Custom Fields | Thêm field tùy chỉnh | Should | - Tạo field- Hiển thị form |
| **BR-026** | Label/Tag | Gắn nhãn cho task | Should | - Add label- Filter |
| **BR-027** | Attachment | Đính kèm file vào task | Should | - Upload file- Dowload |
| **BR-028** | Dependency | Task phụ thuộc nhau | Could | - Task A -> B |

### 6.7. Hiệu năng & Hệ thống 
| ID | Tên yêu cầu | Mô tả | Ưu tiên | Tiêu chí chấp nhận |
|----|-------------|-------|---------|--------------------|
| **BR-029** | Hiệu năng | Hệ thống xử lý nhanh | Must | - Load <3s |
| **BR-030** | Khả năng mở rộng | Hỗ trợ nhiều user | Should | Không crash |
| **BR-031** | Tính ổn định | Hệ thống hoạt động ổn định | Must | Không lỗi nghiêm trọng | 

## 7. Quy tắc nghiệp vụ
| ID | Quy tắc | Mô tả | Áp dụng |
|----|---------|-------|---------|
| **BR-01** | Cấu trúc phân cấp | Hệ thống phải tuân theo cấu trúc: Workspace → Project → Task → Sub-task. Không cho phép tạo entity ngoài cấu trúc. | Toàn hệ thống |
| **BR-02** | Phân quyền RBAC | Quyền truy cập dựa trên vai trò (Admin, Owner, Manager, Member, Guest). Không được vượt quyền. | Toàn hệ thống |
| **BR-03** | Phân quyền theo scope | User chỉ truy cập dữ liệu thuộc workspace/project được gán. | Workspace, Project |
| **BR-04** | Trạng thái bắt buộc | Task phải có trạng thái hợp lệ (To-do, In Progress, Done). | Task |
| **BR-05** | Workflow cấu hình | Luồng trạng thái có thể cấu hình theo project type, không hardcode. | Project |
| **BR-06** | Quan hệ dữ liệu | Task phải thuộc Project, Project phải thuộc Workspace. Không cho phép dữ liệu “mồ côi”. | Toàn hệ thống |
| **BR-07** | Gán người thực hiện | Task phải có ít nhất một assignee. | Task |
| **BR-08** | Deadline hợp lệ | Deadline task không được vượt quá deadline project. | Task, Project |
| **BR-09** | Audit log | Mọi thay đổi phải được ghi lại (user, thời gian, hành động). | Toàn hệ thống |
| **BR-010** | Soft delete | Xóa dữ liệu là xóa mềm, có thể khôi phục trong thời gian nhất định. | Toàn hệ thống |
| **BR-011**| Xác thực bắt buộc | Người dùng phải đăng nhập để truy cập hệ thống. | Toàn hệ thống |  
| **BR-012** | Toàn vẹn dữ liệu | Không cho phép xóa project nếu còn task chưa hoàn thành. | Project |

## 8.Usecase tổng quan
### UC-01: Đội phát triển phần mềm (Software Development)  

| Hạng mục | Chi tiết |
|----------|----------|
| **Actor** | Developer, Tech Lead, Scrum Master, Product Owner |
| **Project types** | Feature development, bug fixing, system improvement, migration |
| **Luồng chính** | 1. PO tạo project (Software Dev)2. Tạo backlog3. Sprint planning4. Dev nhận task và thực hiện5. Update status (To-do → In Progress → Review → Done)6. Code review & approval7. Release theo milestone |
| **Related Items** | Task ←[derived_from]→ Bug ReportTask ←[related_to]→ Feature RequestTask ←[references]→ Technical DocumentTask ←[assigned_to]→ UserProject ←[owned_by]→ Team |
| **Giá trị** | Quản lý vòng đời phát triển phần mềm. Truy vết từ yêu cầu → triển khai → release. |

### UC-02: Quản lý dự án nội bộ (Internal Project)
| Hạng mục | Chi tiết |
|----------|----------|
| **Actor** | Project Manager, Team Leader, Member |
| **Project types** | Internal project, operation, process improvement |
| **Luồng chính** | 1. Manager tạo project2. Thiết lập milestone3. Tạo và phân công task4. Member thực hiện5. Update tiến độ6. Đóng project | 
| **Related Items** | Project ←[contains]→ MilestoneMilestone ←[contains]→ TaskTask ←[assigned_to]→ UserTask ←[tracked_by]→ Status |
| **Giá trị** | Quản lý công việc nội bộ rõ ràng. Theo dõi tiến độ và trách nhiệm. |

### UC-03: Quản lý Workspace & Thành viên
| Hạng mục | Chi tiết |
|----------|----------|
| **Actor** | System Admin, Workspace Owner |
| **Project** | Organization workspace |
| **Luồng chính** | 1. Tạo workspace2. Mời user tham gia3. Gán role (Owner, Admin, Member)4. Quản lý danh sách member5. Phân quyền truy cập |
| **Related time** | Workspace ←[has]→ UserUser ←[has_role]→ RoleWorkspace ←[contains]→ Project |
| **Giá trị** | Quản lý tổ chức và phân quyền tập trung. Kiểm soát truy cập dữ liệu. |

### UC-04: Cộng tác & giao tiếp (Collaboration)
| Hạng mục | Chi tiết |
|----------|----------|
| **Actor** | Member, Manager |
| **Project** | All project types |
| **Luồng chính** | 1. User mở task2. Comment trao đổi3. Mention người liên quan4. Cập nhật thông tin task5. Theo dõi lịch sử |
| **Related time** | Task ←[has]→ CommentComment ←[mentions]→ UserTask ←[updated_by]→ UserActivity Log ←[tracks]→ Action | 
| **Giá trị** | Tăng minh bạch và giao tiếp trong team. Lưu trữ toàn bộ lịch sử làm việc. |

### UC-05: Theo dõi tiến độ & Dashboard
| Hạng mục | Chi tiết |
|----------|----------|
| **Actor** | Manager, Stakeholders |
| **Project** | All project types |
| **Luồng chính** | 1. Truy cập dashboard2. Xem trạng thái task3. Xem tiến độ milestone4. Đánh giá hiệu suất |
| **Related time** | Project ←[aggregates]→ TaskTask ←[has]→ StatusMilestone ←[tracks]→ Progress |
| **Giá trị** | Cung cấp cái nhìn tổng thể. Hỗ trợ ra quyết định nhanh. |

### UC-06: Quản lý Task nâng cao
| Hạng mục | Chi tiết |
|----------|----------|
| **Actor** | Member, Manager |
| **Project** | All project types |
| **Luồng chính** | 1. Tạo task2. Thêm sub-task3. Gán nhiều assignee4. Thêm label/tag5. Thiết lập dependency |
| **Related time** | Task ←[has]→ Sub-taskTask ←[assigned_to]→ UserTask ←[has]→ LabelTask ←[depends_on]→ Task |
| **Giá trị** | Quản lý công việc chi tiết và linh hoạt hơn. |

### UC-07: Tùy chỉnh hệ thống (Customization)
| Hạng mục | Chi tiết |
|----------|----------|
| **Actor** | Admin |
| **Project** | Configurable project |
| **Luồng chính** | 1. Tạo custom fields2. Cấu hình workflow3. Áp dụng cho project type4. Sử dụng trong task |
| **Related time** | Project ←[has]→ WorkflowTask ←[has]→ Custom FieldWorkflow ←[defines]→ Status |
| **Giá trị** | Linh hoạt theo nhu cầu doanh nghiệp. |

### UC-08: Xác thực & truy cập hệ thống
| Hạng mục | Chi tiết |
|----------|----------|
| **Actor** | User |
| **Project** | System |
| **Luồng chính** | 1. Đăng ký tài khoản2. Đăng nhập3. Truy cập hệ thống4. Logout |
| **Related time** | User ←[authenticates]→ SystemUser ←[has]→ Credential |
| **Giá trị** | Đảm bảo bảo mật và kiểm soát truy cập. |

## 9. Ràng buộc & Giả định
### 9.1. Ràng buộc
