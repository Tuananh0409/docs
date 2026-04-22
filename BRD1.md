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