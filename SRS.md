## TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM

## (SOFTWARE REQUIREMENTS SPECIFICATION - SRS)

## PHÁT TRIỂN PHẦN MỀM QUẢN LÝ DỰ ÁN CHO NỘI BỘ

I. Tổng quan tài liệu

1. Mục đích tài liệu

Hệ thống được thiết kế phục vụ cho toàn bộ nhân sự trong công ty, bao gồm nhiều phòng ban và vai trò khác nhau.

Các phòng ban sử dụng hệ thống bao gồm nhưng không giới hạn:

Phòng Kỹ thuật (IT/Developer)

Phòng Kinh doanh (Sales)

Phòng Marketing

Phòng Nhân sự (HR)

Phòng Tài chính (Finance)

Các bộ phận khác theo cơ cấu tổ chức của công ty

Mỗi phòng ban sẽ được tổ chức thành một Workspace riêng biệt trong hệ thống để đảm bảo quản lý độc lập và bảo mật dữ liệu.


2. Phạm vi tài liệu

Tài liệu này áp dụng cho hệ thống web nội bộ của công ty, bao gồm các chức năng:

Quản lý workspace theo phòng ban

Quản lý dự án (Project)

Quản lý milestone và task

Phân công công việc và theo dõi tiến độ

Quản lý người dùng và phân quyền

Không bao gồm:

Quản lý tài chính dự án

Tích hợp sâu với hệ thống bên ngoài (giai đoạn đầu)

3. Đối tượng sử dụng hệ thống

Hệ thống được sử dụng bởi toàn bộ nhân sự trong công ty, bao gồm:

Phòng Kỹ thuật (IT/Developer)

Phòng Kinh doanh (Sales)

Phòng Marketing

Phòng Nhân sự (HR)

Phòng Tài chính (Finance)

Các bộ phận khác

Mỗi phòng ban sẽ làm việc trong một Workspace riêng biệt.

4. Vai trò người dùng




II. Khái quát yêu cầu

1. Mô hình tổng quan

Workspace → Project → Milestone → Task → User

2. Mô tả các bước trong mô hình





III. Yêu cầu chức năng

1. YC1_WORKSPACE: Quản lý Workspace & thành viên

1.1. User Story: Tạo Workspace

### Mệnh đề

Với vai trò là Admin, tôi muốn tạo workspace để tổ chức các phòng ban làm việc riêng biệt trong hệ thống.

Tiêu chí chấp nhận(AC - Acceptance Criteria)

AC1: Tạo workspace thành công

Given tôi là Admin và đã đăng nhập hệ thống

When tôi nhập tên workspace hợp lệ và nhấn “Tạo”

Then hệ thống tạo workspace mới và hiển thị trong danh sách workspace

AC2: Validate tên workspace

Given tôi để trống tên workspace

When tôi nhấn “Tạo”

Then hệ thống hiển thị thông báo lỗi “Tên workspace không được để trống”

AC3: Không cho phép trùng tên

Given đã tồn tại workspace có tên “Marketing”

When tôi tạo workspace với tên “Marketing”

Then hệ thống hiển thị lỗi “Workspace đã tồn tại”

## UI



## API



## DB



1.2. User Story: Thêm thành viên vào Workspace

### Mệnh đề

Admin muốn thêm người dùng vào workspace để quản lý theo phòng ban.

Tiêu chí chấp nhận

AC1: Thêm thành công

Given user tồn tại

When thêm vào workspace

Then user xuất hiện trong danh sách thành viên

AC2: Không trùng

Given user đã thuộc workspace

Then hệ thống từ chối

## UI


## API



## DB




2. YC2_PROJECT: Quản lý Project

2.1. User Story: Tạo Project

### Mệnh đề

Admin muốn thêm người dùng vào workspace để quản lý theo phòng ban.

Tiêu chí chấp nhận

AC1: Thêm thành công

Given user tồn tại

When thêm vào workspace

Then user xuất hiện trong danh sách thành viên

AC2: Không trùng

Given user đã thuộc workspace

Then hệ thống từ chối

## UI



## API



## DB



3. YC3_TASK_ASSIGN: Tạo và phân công Task

3.1. User Story: Tạo Task

### Mệnh đề

Admin muốn thêm người dùng vào workspace để quản lý theo phòng ban.

Tiêu chí chấp nhận

AC1: Thêm thành công

Given user tồn tại

When thêm vào workspace

Then user xuất hiện trong danh sách thành viên

AC2: Không trùng

Given user đã thuộc workspace

Then hệ thống từ chối

## UI



## API



## DB



3.2. User Story: Phân công Task

### Mệnh đề

Với vai trò là Manager/Lead, tôi muốn phân công task cho nhân sự.

Tiêu chí chấp nhận

AC1: Assign thành công

Given user thuộc project

When assign

Then user nhận task

AC2: Validate user

Given user không thuộc project

Then hệ thống từ chối

## UI



## API



## DB



# 4 [YC4_TASK_PROGRESS]: Cập nhật trạng thái Task

## 4.1 User Story: Cập nhật trạng thái Task

### Mệnh đề

Với vai trò là User, tôi muốn cập nhật trạng thái task để phản ánh tiến độ công việc.

Tiêu chí chấp nhận

AC1: Cập nhật thành công

Given task được assign

When user cập nhật trạng thái

Then hệ thống lưu trạng thái mới

AC2: Trạng thái hợp lệ

Given trạng thái không thuộc (To do / In progress / Done)

Then hệ thống báo lỗi

AC3: Lưu lịch sử

When trạng thái thay đổi

Then hệ thống ghi nhận thời gian cập nhật

## UI

## API

## DB



# 5 [YC5_DASHBOARD]: Theo dõi tiến độ

## 5.1 User Story: Xem Dashboard

### Mệnh đề

Với vai trò là Manager, tôi muốn theo dõi tiến độ dự án để kiểm soát tình trạng công việc.

Tiêu chí chấp nhận

AC1: Hiển thị tiến độ tổng

When mở dashboard

Then hiển thị % hoàn thành dự án

AC2: Hiển thị task theo trạng thái

Then hiển thị số lượng task theo từng trạng thái

AC3: Hiển thị task trễ hạn

Then hiển thị danh sách task quá deadline

## UI



## API




# 6 [YC6_COMMENT]: Trao đổi trong Task

## 6.1 User Story: Comment Task

### Mệnh đề

Với vai trò là User, tôi muốn trao đổi trực tiếp trong task để phối hợp công việc hiệu quả.

Tiêu chí chấp nhận

AC1: Thêm comment

Given nhập nội dung

When gửi

Then comment được lưu

AC2: Hiển thị comment

When mở task

Then hiển thị danh sách comment theo thời gian

AC3: Validate rỗng

Given nội dung trống

Then không cho gửi

## UI


## API



## DB



IV. Yêu cầu phi chức năng

1. Tính bảo mật

Hệ thống cần đảm bảo an toàn thông tin và kiểm soát truy cập theo vai trò người dùng.

Người dùng phải đăng nhập trước khi truy cập hệ thống.

Mỗi người dùng chỉ được truy cập các chức năng và dữ liệu phù hợp với vai trò (Admin, Manager, Lead, User).

Mật khẩu người dùng phải được mã hóa khi lưu trữ trong hệ thống.

Hệ thống phải ghi nhận lịch sử hoạt động (log) của người dùng như: tạo task, cập nhật task, phân công công việc.

Không cho phép truy cập trái phép vào dữ liệu của workspace hoặc project khác.

2. Hiệu năng (Performance)

Hệ thống cần đảm bảo khả năng xử lý nhanh và ổn định khi có nhiều người dùng truy cập đồng thời.

Thời gian phản hồi cho các thao tác chính (tạo project, tạo task, cập nhật trạng thái) không vượt quá 3 giây trong điều kiện bình thường.

Trang dashboard hiển thị tiến độ dự án phải tải trong vòng ≤ 5 giây.

Hệ thống phải hỗ trợ tối thiểu 200–500 người dùng đồng thời mà không bị gián đoạn.

Các thao tác tìm kiếm và lọc dữ liệu phải trả kết quả trong vòng ≤ 2 giây.

3.  Khả dụng (Usability)

Hệ thống cần đảm bảo dễ sử dụng và thân thiện với người dùng.

Giao diện người dùng phải rõ ràng, dễ hiểu, phù hợp với người không có chuyên môn kỹ thuật.

Các thao tác chính (tạo task, cập nhật trạng thái, phân công công việc) không vượt quá 3–5 bước.

Các trạng thái công việc (To do, In progress, Done) phải được hiển thị rõ ràng.

Hệ thống phải hỗ trợ hiển thị tốt trên các trình duyệt phổ biến (Chrome, Edge, Firefox).

Giao diện phải responsive, hiển thị tốt trên các thiết bị khác nhau (desktop, tablet).



