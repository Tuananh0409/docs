# [cite_start]TÀI LIỆU YÊU CẦU NGHIỆP VỤ (BRD) [cite: 1]

[cite_start]**DỰ ÁN: HỆ THỐNG QUẢN TRỊ DỰ ÁN NỘI BỘ TẬP TRUNG (UNIFIED INTERNAL PROJECT MANAGEMENT)** [cite: 2]

---

## [cite_start]1. BỐI CẢNH VÀ THỰC TRẠNG (BUSINESS CONTEXT) [cite: 3]
[cite_start]Trong giai đoạn mở rộng quy mô, doanh nghiệp đang đối mặt với các thách thức lớn trong quản trị vận hành do sự thiếu hụt công cụ tập trung: [cite: 4]
* [cite_start]**Sự rời rạc của dữ liệu:** Phụ thuộc vào Spreadsheet (Excel) và Email khiến thông tin bị phân mảnh, không có tính kế thừa và khó tra cứu lịch sử thay đổi. [cite: 5]
* [cite_start]**Ốc đảo thông tin (Data Silos):** Thông tin dự án bị khu trú tại từng bộ phận, gây khó khăn cho việc phối hợp liên phòng ban (Sales - Marketing - Engineering) và làm mờ tầm nhìn của cấp lãnh đạo. [cite: 6]
* [cite_start]**Rủi ro vận hành:** Theo dõi thủ công dẫn đến mất dấu thông tin, khó kiểm soát tiến độ thời gian thực và đánh giá hiệu suất nhân sự thiếu khách quan. [cite: 7]

## [cite_start]2. MỤC TIÊU CHIẾN LƯỢC (BUSINESS OBJECTIVES) [cite: 8]
[cite_start]Xây dựng nền tảng Web quản trị tập trung nhằm đạt được: [cite: 9]
* [cite_start]**Tập trung hóa:** Quy hoạch mọi dữ liệu dự án về một "nguồn sự thật duy nhất" (Single Source of Truth). [cite: 10]
* [cite_start]**Tối ưu phối hợp:** Cải thiện tốc độ làm việc nhóm và liên thông dữ liệu thông suốt giữa các phòng ban. [cite: 11]
* [cite_start]**Nâng cao năng lực quản lý:** Cung cấp công cụ Dashboard thời gian thực để đo lường hiệu suất và kiểm soát chặt chẽ các mốc quan trọng (Milestones). [cite: 12]

## [cite_start]3. PHẠM VI DỰ ÁN (PROJECT SCOPE) [cite: 13]
* [cite_start]**Trong phạm vi (In-scope):** Hệ thống Web quản trị, quản lý Workspace, quản lý Task/Milestone, Dashboard báo cáo và tính năng liên thông dữ liệu. [cite: 14]
* [cite_start]**Ngoài phạm vi (Out-of-scope):** Ứng dụng di động (Mobile App) chuyên biệt và hệ thống kế toán/tài chính chuyên sâu. [cite: 15]

## [cite_start]4. YÊU CẦU NGHIỆP VỤ CỐT LÕI (CORE BUSINESS REQUIREMENTS) [cite: 16]
[cite_start]Hệ thống được thiết kế theo triết lý: **"Tiện lợi như Excel - Kỷ luật như Phần mềm chuyên nghiệp"**. [cite: 17]

### 4.1. [cite_start]Trải nghiệm người dùng (UX) & Nhập liệu [cite: 18]
* [cite_start]**Giao diện Grid view:** Cho phép chỉnh sửa trực tiếp, hỗ trợ phím tắt và copy-paste từ Excel để giảm thiểu rào cản chuyển đổi. [cite: 19]
* [cite_start]**Tương tác thời gian thực:** Tích hợp tính năng Thảo luận (Comment) và Gắn thẻ (Tag) ngay trên từng Task để tập trung luồng trao đổi. [cite: 20]

### 4.2. [cite_start]Cấu trúc và Phân quyền [cite: 21]
* [cite_start]**Workspace theo phòng ban:** Thiết lập không gian làm việc chuyên biệt cho Sales, Marketing, Engineering... nhưng hỗ trợ liên kết dự án liên phòng ban. [cite: 22]
* [cite_start]**Vai trò người dùng:** Phân quyền chi tiết (Admin, Manager, Member, Viewer) để kiểm soát quyền xem và chỉnh sửa dữ liệu. [cite: 23]

### 4.3. [cite_start]Quản lý Task và Tiến độ [cite: 24]
* [cite_start]**Phân rã mục tiêu:** Chia nhỏ dự án thành các Milestone và Task chi tiết. [cite: 25]
* [cite_start]**Đa dạng hóa góc nhìn:** Cung cấp các chế độ xem linh hoạt gồm Danh sách (List), Bảng (Kanban), và Sơ đồ tiến độ (Gantt Chart). [cite: 26]
* [cite_start]**Cảnh báo thông minh:** Tự động thông báo khi có đầu việc sắp đến hạn hoặc bị chậm trễ. [cite: 27]

### 4.4. [cite_start]Liên thông dữ liệu (Data Integration) [cite: 28]
* [cite_start]**Kết nối hệ thống:** Khả năng lấy dữ liệu từ CRM hoặc hệ thống Hợp đồng để khởi tạo dự án tự động. [cite: 29]
* [cite_start]**Kế thừa thông tin:** Dữ liệu đầu ra của bộ phận trước tự động trở thành đầu vào cho bộ phận sau trên cùng một dự án. [cite: 30]

## [cite_start]5. YÊU CẦU NGHIỆP VỤ QUẢN TRỊ & HỖ TRỢ (ADMIN & SUPPORT) [cite: 31]
* [cite_start]**Quản trị tài khoản:** Quản lý vòng đời nhân sự (tạo mới, phân quyền, thu hồi khi nghỉ việc). [cite: 32]
* [cite_start]**Quản lý Tài nguyên (Resource Management):** [cite: 33]
    * [cite_start]Thiết lập lịch làm việc chung và ngày nghỉ để tính toán tiến độ chính xác. [cite: 34]
    * [cite_start]Biểu đồ tải công việc (Workload Chart) để điều phối nhân sự, tránh quá tải. [cite: 35]
* [cite_start]**Quản lý Tài liệu:** Đính kèm file trực tiếp và quản lý phiên bản (Versioning) để tránh nhầm lẫn giữa các bản nháp. [cite: 36]
* [cite_start]**Quy trình Phê duyệt (Approval Workflow):** Luồng phê duyệt khi hoàn thành Milestone hoặc khi có yêu cầu thay đổi (Change Request) về phạm vi/thời hạn. [cite: 37]

## [cite_start]6. QUY TẮC NGHIỆM VỤ (BUSINESS RULES) [cite: 38]
* [cite_start]**Quyền hạn:** Nhân viên chỉ thấy các Workspace mà mình được mời hoặc có quyền truy cập. [cite: 39]
* [cite_start]**Tự động hóa:** Trạng thái dự án tự động cập nhật dựa trên % hoàn thành của các Task thành phần. [cite: 40]
* [cite_start]**Lưu vết (Audit Log):** Mọi thay đổi về thời hạn, người phụ trách hoặc trạng thái phải được hệ thống ghi lại lịch sử để đối soát. [cite: 41]

## [cite_start]7. TIÊU CHÍ NGHIỆM THU (USER ACCEPTANCE CRITERIA) [cite: 42]
* [cite_start]**Độ bao phủ:** 100% các phòng ban mục tiêu vận hành quy trình trên hệ thống. [cite: 43]
* [cite_start]**Hiệu năng:** Thao tác nhập liệu và cập nhật trạng thái đạt tốc độ tương đương hoặc nhanh hơn Spreadsheet cũ. [cite: 44]
* [cite_start]**Độ tin cậy:** Hệ thống sẵn sàng 24/7 và dữ liệu được sao lưu định kỳ hàng ngày. [cite: 45]

## [cite_start]8. RỦI RO VÀ GIẢI PHÁP (RISKS & MITIGATIONS) [cite: 46]
* [cite_start]**Rủi ro:** Sự kháng cự thay đổi từ nhân sự quen dùng công cụ truyền thống. [cite: 47]
* [cite_start]**Giải pháp:** Tập trung tối đa vào UX cực giản, tổ chức đào tạo nội bộ bài bản và thiết lập cơ chế ghi nhận cập nhật dữ liệu đúng hạn. [cite: 48]

---

## [cite_start]PHỤ LỤC: DANH MỤC THUẬT NGỮ [cite: 49]
* [cite_start]**Single Source of Truth:** Một nguồn dữ liệu duy nhất đáng tin cậy. [cite: 50]
* [cite_start]**Gantt Chart:** Sơ đồ biểu diễn tiến độ dự án theo thời gian. [cite: 51]
* [cite_start]**Audit Log:** Nhật ký ghi lại các thay đổi của hệ thống. [cite: 52]