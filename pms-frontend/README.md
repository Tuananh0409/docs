# CTEL PM — Frontend

React + Vite + Tailwind CSS 4.

## Chạy dev

1. Backend chạy tại `http://localhost:8080`
2. PostgreSQL: `docker compose up -d` (thư mục gốc repo)

```bash
cd pms-frontend
npm install
npm run dev
```

Mở http://localhost:5173

## Đăng nhập

- Đăng ký / đăng nhập tại `/login`, `/register`
- Dev seed: `admin@ctel.local` / `Admin@123` (sau Flyway V4)
- JWT trong cookie **httpOnly** `pms_access_token`; request dùng `credentials: include`
- Cài đặt tài khoản: `/settings` (hồ sơ, đổi mật khẩu)

## Tính năng

- **Tổng quan** (`/`) — dashboard thống kê đơn giản, workspace gần đây
- **Workspace** (`/workspaces`) — danh sách / tạo workspace
- Chi tiết workspace (`/workspaces/:id`), mời thành viên
- Chấp nhận lời mời: `/invitations/{token}/accept`
- **Task** — CRUD trong dự án (Backlog/Board), gán người, trạng thái, comment, file đính kèm; **Công việc của tôi** (`/my-tasks`)

## Giao diện & icon

- Sidebar trái + top bar (`AppShell`)
- Icon thống nhất: **[lucide-react](https://lucide.dev)** (menu, topbar, cây workspace)
- Component dùng lại: `@/components` (barrel) hoặc `@/shared/components/...` (chi tiết)

## Cấu trúc thư mục

```
src/
  components/            # Barrel export: Button, Modal, layout, icons…
  app/                    # App shell: providers, router
  shared/
    api/                  # HTTP client, types lỗi API
    components/
      icons/              # NavMenuIcon (Lucide, kích thước menu)
      ui/                 # Button, Modal, Badge (dùng chung)
      layout/             # AppShell, AppSidebar, AppTopBar, PageHeader
      feedback/           # Loading, Error, Empty
    config/               # navigation (sidebar) — dùng Lucide
    context/              # AuthProvider
  features/
    workspace/            # Module workspace
      api/                # workspaceApi, invitationApi
      types/
      components/
      pages/
```

Import alias: `@/` → `src/` (xem `vite.config.ts`, `tsconfig.json`).

**Mạng nội bộ / lỗi SSL khi `npm install`:** thử `npm install --strict-ssl=false` (chỉ khi hiểu rủi ro).

Thêm module mới (vd. `project`): tạo `src/features/project/` với cùng pattern `api/`, `types/`, `components/`, `pages/`, rồi đăng ký route trong `src/app/router.tsx`.
