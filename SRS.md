# Tài liệu đặc tả yêu cầu phần mềm (SRS)
1# Phần mềm Quản lý dự án & Công việc nội bộ

> **Phiên bản:** 1.0
> **Ngày tạo:** 22/04/2026
> **Tác giả:** Tuán Minh, Tuan Anh
> **Trạng thái** Draft
> **Phân loại** Nội bộ - Bảo mật

---

## Mục lục

1. [Tổng quan tài liệu](#1-tổng-quan-tài-liệu)
2. [Phạm vi](#2-phạm-vi)
3. [Khái quát yêu cầu](#3-khái-quát-yeu-cầu)
4. [Yêu cầu chức năng](#4-yêu-cầu-chức-năng)
5. [Yêu cầu phi chức năng](#5-yêu-cầu-phi-chức-năng)

## 1. Tổng quan tài liệu

### 1.1. Mục đích

Tài liệu này mô tả chi tiết các yêu cầu chức năng và phi chức năng của hệ thống Project Management System được phát triển cho mục đích sử dụng nội bộ trong công ty.

Hệ thống được xây dựng nhằm giải quyết các vấn đề hiện tại trong việc quản lý dự án, bao gồm:

Thiếu sự minh bạch trong việc theo dõi tiến độ công việc
Thông tin dự án bị phân tán trên nhiều công cụ (email, spreadsheet, chat)
Khó khăn trong việc phối hợp giữa các phòng ban
Không có cái nhìn tổng thể về trạng thái dự án

### 1.2. Đối tượng sử dụng
Các phòng ban sử dụng hệ thống bao gồm nhưng không giới hạn:
Phòng Kỹ thuật (IT/Developer)
Phòng Kinh doanh (Sales)
Phòng Marketing
Phòng Nhân sự (HR)
Phòng Tài chính (Finance)
Các bộ phận khác theo cơ cấu tổ chức của công ty

## 2. Phạm vi
### 2.1. Trong phạm vi 
| # | Hạng mục | Mô tả |
|---|----------|-------|
| S1 | Quản lý Workspace | Hệ thống cho phép tạo, cập nhật, xóa workspace; quản lý thành viên và phân quyền theo vai trò |
| S2 | Quản lý Project | Hệ thống cho phép tạo, cập nhật, xóa project; gán thành viên và cấu hình project | 
| S3 | Quản lý Task | Hệ thống hỗ trợ tạo, cập nhật, xóa task; gán assignee; quản lý trạng thái và deadline |
| S4 | Cấu trúc phân cấp | Hệ thống hỗ trợ cấu trúc dữ liệu: Workspace → Project → Milestone → Task → Sub-task |
| S5 | Workflow trạng thái | Hệ thống cho phép cấu hình luồng trạng thái (status flow) theo từng project type |
| S6 | Quản lý tiến độ | Hệ thống cung cấp theo dõi tiến độ thông qua milestone, dashboard và trạng thái task |
| S7 | Cộng tác | Hệ thống hỗ trợ comment, mention user, và lưu lịch sử hoạt động (activity log) |
| S8 | Phân quyền truy cập | Hệ thống áp dụng RBAC để kiểm soát truy cập theo role và phạm vi (workspace/project) |
| S9 | Dashboard & báo cáo | Hệ thống hiển thị tổng quan tiến độ project, task và workload của user |
| S10 | Xác thực người dùng | Hệ thống hỗ trợ đăng ký, đăng nhập và quản lý phiên làm việc của người dùng |

### 2.2. Ngoài phạm vi

| # | Hạng mục | Lý do |
|---|----------|-------|
| O1 | AI & Automation | Để phase sau |
| O2 | Mobile native app | Web responsive đủ cho MVP |
| O3 | Integration (HRM/CRM) | Chưa cần thiết giai đoạn đầu |

## 3. Khái quát yêu cầu
### 3.1. Mô hình tổng quan
Workspace → Project → Milestone → Task → User

### 3.2. Mô tả các bước trong mô hình

| STT | Bước quy trình | Người thực hiện | Mô tả bước thực hiện |
|-----|----------------|-----------------|----------------------|
| 1 | Thiết lập Workspace và người dùng | Admin | Tạo workspace cho phòng ban, thêm người dùng, gán vai trò và phân quyền truy cập hệ thống |
| 2 | Khởi tạo Project & phân quyền | Manager | Tạo dự án, nhập thông tin cơ bản và thiết lập quyền trong project, bao gồm việc chỉ định Lead (nếu có) để hỗ trợ quản lý và phân công công việc. |
| 3 | Lập kế hoạch & tạo Task | Manager / Lead | Xây dựng milestone và tạo các, xác định nội dung công, độ ưu, deadline và phạm vi thực hiện |
| 4 | Phân công & thực hiện Task | Manager / Lead / User | Manager hoặc Lead phân công task cho nhân sự; User thực hiện công việc, cập nhật trạng thái, tiến độ và kết quả trên hệ thống |
| 5 | Theo dõi & điều chỉnh | Manager / Lead | Theo dõi tiến độ dự án thông qua dashboard, kiểm tra trạng thái task, xử lý task trễ hạn và điều chỉnh kế hoạch hoặc phân công khi cần |
| 6 | Báo cáo & kết thúc  | Manager / Stakeholder | Xem báo cáo tổng hợp, đánh giá hiệu quả dự án và thực hiện đóng dự án khi hoàn thành |

## 4. Yêu cầu chức năng
### 4.1. Workspace Module
#### 4.1.1. Workspace Admin

| # | Chức năng | Mô tả | Kết quả mong đợi |
|---|-----------|-------|
| **FR-01** | Tạo workspace | Cho phép Admin tạo workspace với tên, mô tả | Workspace được tạo thành công và hiển thị trong danh sách |
| **FR-02** | Cập nhật workspace | Workspace Admin chỉnh sửa các thông tin như tên, mô tả hoặc cấu hình của workspace hiện tại | Thông tin workspace được cập nhật chính xác |
| **FR-03** | Xóa workspace | Workspace Admin thực hiện thao tác xóa workspace và xác nhận hành động này | Workspace bị xóa khỏi hệ thống |
| **FR-04** | Xem danh sách workspace | Workspace Admin truy cập và xem toàn bộ danh sách workspace mà mình quản lý | Danh sách workspace hiển thị đầy đủ |
| **FR-05** | Xem chi tiết workspace | Workspace Admin truy cập vào một workspace cụ thể để xem thông tin chi tiết | Thông tin workspace hiển thị rõ ràng | 
| **FR-06** | Mời user | Workspace Admin nhập email và gửi lời mời người dùng tham gia workspace | Người dùng nhận được lời mời |
| **FR-07** | Xóa user | Workspace Admin loại bỏ người dùng khỏi workspace | Người dùng bị xóa khỏi workspace |
| **FR-08** | Cập nhật role user | Workspace Admin thay đổi vai trò của người dùng trong workspace (Admin/Member) | Role của người dùng được cập nhật |

#### 4.1.2. Member

| # | Chức năng | Mô tả | Kết quả mong đợi |
|---|-----------|-------|------------------|
| **FR-01** | Xem danh sách workspace | Member truy cập và xem danh sách workspace mà mình được tham gia | Danh sách workspace hiển thị |
| **FR-02** | Xem chi tiết workspace | Member truy cập workspace để xem các thông tin cơ bản | Thông tin workspace hiển thị |
| **FR-03** | Xem chi tiết workspace | Member truy cập workspace để xem các thông tin cơ bản | Thông tin workspace hiển thị |
| **FR-04** | Tham gia workspace | Member chấp nhận lời mời tham gia workspace từ hệ thống | Member tham gia workspace thành công |  

### 4.2. Project Module
#### 4.2.1. Project Admin

| # | Chức năng | Mô tả | Kết quả |
|---|-----------|-------|---------|
| **FR-01** | Tạo project | Admin tạo một project mới trong workspace bằng cách nhập thông tin cần thiết | Project được tạo thành công |
| **FR-02** | Cập nhật project | Admin chỉnh sửa thông tin của project như tên, mô tả hoặc trạng thái | Thông tin project được cập nhật |
| **FR-03** | Xóa project | Admin thực hiện xóa project khỏi hệ thống | Project bị xóa |
| **FR-04** | Xem danh sách project | Admin truy cập danh sách tất cả project trong workspace | Danh sách project hiển thị |
| **FR-05** | Xem chi tiết project | Admin truy cập để xem thông tin chi tiết của project | Thông tin project hiển thị |
| **FR-06** | Thêm user | Admin thêm người dùng vào project và gán vai trò phù hợp | Người dùng được thêm vào project |
| **FR-07** | Xóa user | Admin loại bỏ người dùng khỏi project | Người dùng bị xóa khỏi project |

#### 4.2.2. Project Manager

| # | Chức năng | Mô tả | Kết quả |
|---|-----------|-------|---------|
| **FR-01** | Tạo project | Project Manager tạo project mới trong phạm vi được phân quyền | Project được tạo |
| **FR-02** | Cập nhật project | Project Manager chỉnh sửa thông tin project để phù hợp với tiến độ thực tế | Thông tin được cập nhật |
| **FR-03** | Xem danh sách project | Project Manager truy cập danh sách project mà mình quản lý | Danh sách hiển thị |
| **FR-04** | Xem chi tiết project | Project Manager xem thông tin chi tiết để theo dõi project | Thông tin hiển thị |
| **FR-05** | Thêm user | Project Manager thêm thành viên vào project để phân công công việc | User được thêm |
| **FR-06** | Xóa user | Project Manager loại bỏ thành viên không còn tham gia project | User bị xóa |
| **FR-07** | Cập nhật role user | Project Manager phân quyền vai trò cho từng thành viên trong project | Role được cập nhật |
| **FR-08** | Xem tiến độ project | Project Manager theo dõi tiến độ tổng thể của project thông qua dashboard | Progress hiển thị |

#### 4.2.3. Member

| # | Chức năng | Mô tả | Kết quả |
|---|-----------|-------|---------|
| **FR-01** | Xem danh sách project | Member truy cập danh sách project mà mình được phân công | Danh sách hiển thị |
| **FR-02** | Xem chi tiết project | Member xem thông tin chi tiết project để thực hiện công việc | Thông tin hiển thị |

### 4.3. Milestone Module
#### 4.3.1. Project Manager

| # | Chức năng | Mô tả | Kết quả |
|---|-----------|-------|---------|
| **FR-01** | Tạo milestone | Project Manager tạo milestone để xác định các mốc quan trọng của project | Milestone được tạo | 
| **FR-02** | Cập nhật milestone | Project Manager chỉnh sửa thông tin milestone khi cần thiết | Thông tin được cập nhật | 
| **FR-03** | Xóa milestone | Project Manager xóa milestone không còn sử dụng | Milestone bị xóa | 
| **FR-04** | Xem danh sách milestone | Project Manager xem danh sách các milestone trong project | Danh sách hiển thị | 
| **FR-05** | Xem chi tiết milestone | Project Manager xem thông tin chi tiết của milestone | Thông tin hiển thị |

#### 4.3.2. Member

| # | Chức năng | Mô tả | Kết quả |
|---|-----------|-------|---------|
| **FR-01** | Xem danh sách milestone | Member truy cập danh sách milestone để theo dõi tiến độ | Danh sách hiển thị |
| **FR-02** | Xem chi tiết milestone | Member xem chi tiết milestone để hiểu mục tiêu | Thông tin hiển thị |

### 4.4. Task Module
#### 4.4.1. Project Manager

| # | Chức năng | Mô tả | Kết quả |
|---|-----------|-------|---------|
| **FR-01** | Tạo task | Project Manager tạo task mới và nhập đầy đủ thông tin như tiêu đề, mô tả, deadline | Task được tạo |
| **FR-02** | Cập nhật task | Project Manager chỉnh sửa thông tin task khi có thay đổi | Task được cập nhật | 
| **FR-03** | Xóa task | Project Manager xóa task không còn cần thiết | Task bị xóa | 
| **FR-04** | Xem danh sách task | Project Manager truy cập danh sách tất cả task trong project | Danh sách hiển thị | 
| **FR-05** | Xem chi tiết task | Project Manager xem chi tiết task để quản lý công việc | Thông tin hiển thị | 
| **FR-06** | Assign task | Project Manager phân công task cho từng thành viên cụ thể | User nhận task | 
| **FR-07** | Cập nhật trạng thái | Project Manager cập nhật trạng thái task theo tiến độ | Status thay đổi |
| **FR-08** | Cập nhật deadline/priority | Project Manager điều chỉnh deadline hoặc mức độ ưu tiên của task | Thông tin cập nhật |

#### 4.4.2. Member

| # | Chức năng | Mô tả | Kết quả |
|---|-----------|-------|---------|
| **FR-01** | Xem danh sách task | Member truy cập danh sách task được giao hoặc thuộc project | Danh sách hiển thị |  
| **FR-02** | Xem chi tiết task | Member xem chi tiết task để thực hiện công việc | Thông tin hiển thị | 
| **FR-03** | Cập nhật trạng thái | Member cập nhật trạng thái task theo tiến độ thực tế | Status thay đổi | 
| **FR-04** | Comment task | Member thêm comment để trao đổi thông tin trong task | Comment hiển thị | 
| **FR-05** | Upload file | Member tải lên file liên quan đến task | File được lưu |

### 4.5. User Module (All Role)

| # | Chức năng | Mô tả | Kết quả |
|---|-----------|-------|---------|
| **FR-01** | Đăng ký | Người dùng nhập thông tin để tạo tài khoản mới | Tài khoản được tạo | 
| **FR-02** | Đăng nhập | Người dùng nhập thông tin xác thực để truy cập hệ thống | Đăng nhập thành công | 
| **FR-03** | Đăng xuất | Người dùng kết thúc phiên làm việc | Đăng xuất thành công | 
| **FR-04** | Cập nhật profile | Người dùng chỉnh sửa thông tin cá nhân | Thông tin được lưu | 
| **FR-05** | Đổi mật khẩu | Người dùng thay đổi mật khẩu để đảm bảo bảo mật | Mật khẩu được cập nhật | 
| **FR-06** | Xem task của tôi | Member truy cập danh sách task được giao cho mình | Task hiển thị |

### 4.6. Report Module
#### 4.6.1. Admin

| # | Chức năng | Mô tả | Kết quả |
|---|-----------|-------|---------|
| **FR-01** | Xem dashboard hệ thống | Admin truy cập dashboard để theo dõi tổng quan hệ thống | Dashboard hiển thị | 
| **FR-02** | Xem báo cáo project | Admin xem báo cáo tiến độ của các project | Report hiển thị | 
| **FR-03** | Xem báo cáo user | Admin theo dõi hiệu suất làm việc của user | Report hiển thị |

#### 4.6.2. Project Manager

| # | Chức năng | Mô tả | Kết quả |
|---|-----------|-------|---------|
| **FR-01** |Xem báo cáo project | Project Manager theo dõi tiến độ project | Report hiển thị | 
| **FR-02** | Xem báo cáo milestone | Project Manager theo dõi milestone | Report hiển thị | 
| **FR-03** | Xem báo cáo user | Project Manager đánh giá hiệu suất thành viên | Report hiển thị |

#### 4.6.3. Member

| # | Chức năng | Mô tả | Kết quả |
|---|-----------|-------|---------|
| **FR-01** | Xem dashboard cá nhân | Member xem tổng quan công việc cá nhân | Dashboard hiển thị |  
| **FR-02** | Xem task gần deadline | Member lọc task sắp đến hạn | Danh sách hiển thị |  
| **FR-03** | Xem task quá hạn | Member lọc task đã quá hạn | Danh sách hiển thị |

### 4.7. Tracking Module
#### 4.7.1. Project manager

| # | Chức năng | Mô tả | Kết quả |
|---|-----------|-------|---------|
| **FR-01** | Xem activity log project | Project Manager theo dõi log của project | Log hiển thị | 
| **FR-02** | Xem lịch sử task | Project Manager xem lịch sử thay đổi task | History hiển thị | 
| **FR-03** | Theo dõi tiến độ task | Project Manager theo dõi tiến độ thực hiện task | Progress hiển thị | 
| **FR-04** | Xem time tracking | Project Manager xem dữ liệu thời gian làm việc | Data hiển thị |

#### 4.7.2. Member

| # | Chức năng | Mô tả | Kết quả |
|---|-----------|-------|---------|
| **FR-01** | Xem activity log | Member xem log liên quan đến task của mình | Log hiển thị |
| **FR-02** | Xem lịch sử task | Member xem lịch sử thay đổi task | History hiển thị |
| **FR-03** | Start/Stop time tracking | Member bắt đầu hoặc dừng ghi nhận thời gian làm việc | Time được lưu |
| **FR-04** | Xem thời gian làm | Member xem dữ liệu thời gian làm việc | Data hiển thị |
| **FR-05** | Nhận notification | Member nhận thông báo từ hệ thống | Notification hiển thị |
| **FR-06** | Xem notification | Member truy cập danh sách thông báo | Danh sách hiển thị |
| **FR-07** | Đánh dấu đã đọc | Member đánh dấu thông báo đã đọc | Trạng thái cập nhật |

### 5. Yêu cầu phi chức năng
#### 5.1. Performance

| ID | Yêu cầu | Mô tả |
|----|---------|-------|
| **NFR-01** | Thời gian phản hồi | Hệ thống phải phản hồi các request thông thường trong vòng ≤ 2 giây |
| **NFR-02** | Tải danh sách | Các danh sách (project, task, workspace) phải load trong ≤ 3 giây với dữ liệu trung bình |
| **NFR-03** | Khả năng chịu tải | Hệ thống phải hỗ trợ tối thiểu 500–1000 người dùng đồng thời |
| **NFR-04** | Xử lý realtime | Các cập nhật trạng thái task, notification phải được phản ánh gần realtime (≤ 1 giây) |

#### 5.2. Security

| ID | Yêu cầu | Mô tả |
|----|---------|-------|
| **NFR-01** |Xác thực người dùng | Hệ thống phải yêu cầu đăng nhập trước khi truy cập dữ liệu |
| **NFR-02** | Phân quyền (RBAC) | Hệ thống phải kiểm soát quyền truy cập theo role (Admin, PM, Member) |
| **NFR-03** | Mã hóa dữ liệu | Dữ liệu nhạy cảm (password) phải được mã hóa (hash + salt) |
| **NFR-04** | Bảo vệ API | API phải được bảo vệ bằng token (JWT hoặc tương đương) |
| **NFR-05** | Session management | Hệ thống phải tự động logout sau thời gian không hoạt động |
| **NFR-06** | Audit log | Hệ thống phải ghi lại log các hành động quan trọng (create, update, delete) |

#### 5.3. Usability

| ID | Yêu cầu | Mô tả |
|----|---------|-------|
| **NFR-01** | Giao diện thân thiện | Giao diện phải dễ sử dụng, rõ ràng với người dùng mới |
| **NFR-02** | Điều hướng | Người dùng có thể truy cập các chức năng chính trong ≤ 3 bước |
| **NFR-03** | Responsive | Hệ thống phải hiển thị tốt trên desktop và tablet |
| **NFR-04** | Thông báo lỗi | Hệ thống phải hiển thị thông báo lỗi rõ ràng, dễ hiểu |

#### 5.4. Reliability

| ID | Yêu cầu | Mô tả |
|----|---------|-------|
| **NFR-01** | Tính ổn định | Hệ thống phải đảm bảo uptime ≥ 99% |
| **NFR-02** | Backup dữ liệu | Dữ liệu phải được backup định kỳ (ít nhất 1 lần/ngày) |
| **NFR-03** | Khôi phục dữ liệu | Hệ thống phải có khả năng khôi phục dữ liệu khi xảy ra sự cố |
| **NFR-04** | Xử lý lỗi | Hệ thống không được crash khi xảy ra lỗi, phải xử lý graceful |

#### 5.5. Logging & Monitoring
| ID | Yêu cầu | Mô tả |
|----|---------|-------|
| **NFR-01** | Logging system | Hệ thống phải ghi log đầy đủ cho backend | 
| **NFR-02** | Monitoring | Hệ thống phải có công cụ giám sát hiệu năng | 
| **NFR-03** | Alert | Hệ thống phải cảnh báo khi có lỗi nghiêm trọng |

