# CTEL PM — Project Management System

Monorepo: **Spring Boot** (backend) + **React/Vite** (frontend) + **PostgreSQL** (Docker).

> Clone repo lần đầu: làm **đúng thứ tự** bên dưới. Thiếu Docker hoặc chạy frontend trước backend thường gây lỗi đăng nhập / Internal Server Error.

---

## Yêu cầu

| Công cụ | Phiên bản gợi ý |
|---------|-----------------|
| [Java](https://adoptium.net/) | **21** (`java -version`) |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | đang **Running** |
| [Node.js](https://nodejs.org/) | LTS (18+) |
| Git | bất kỳ |

---

## Chạy lần đầu (sau khi clone)

Mở **3 terminal** tại thư mục gốc repo (`project-management-system`).

### Bước 1 — PostgreSQL

```powershell
docker compose up -d
docker ps
```

Phải thấy container `pms-postgres` trạng thái **Up (healthy)**.

Nếu cổng `5432` bị chiếm (Postgres cài sẵn trên máy), tắt service đó hoặc đổi port trong `docker-compose.yml` và `pms-backend/src/main/resources/application.properties`.

### Bước 2 — Backend

```powershell
cd pms-backend
.\mvnw.cmd spring-boot:run
```

Đợi log có các dòng tương tự:

- `The following 1 profile is active: "dev"`
- Flyway migrate schema (V1 → V4)
- `Tomcat started on port 8080`

API: http://localhost:8080

**Lần đầu** Maven có thể tải dependency — cần mạng ổn định.

### Bước 3 — Frontend

```powershell
cd pms-frontend
npm install
npm run dev
```

Mở URL Vite in ra (thường http://localhost:5173).

---

## Đăng nhập dev

| Email | Mật khẩu |
|-------|----------|
| `admin@ctel.local` | `Admin@123` |
| `member@ctel.local` | `Admin@123` |

Tài khoản seed qua Flyway (V3 + V4). Có thể đăng ký tài khoản mới tại `/register`.

---

## Kiểm tra nhanh backend

Tạo file `login.json`:

```json
{"email":"admin@ctel.local","password":"Admin@123"}
```

```powershell
curl.exe -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" --data-binary "@login.json"
```

Kết quả mong đợi: **HTTP 200**, JSON user (không có token trong body), và cookie **`pms_access_token`** (httpOnly).

Trình duyệt gửi cookie tự động khi gọi API qua frontend (`credentials: include`). Không lưu JWT trong `localStorage`.

---

## API xác thực (S10)

| Method | Path | Mô tả |
|--------|------|--------|
| POST | `/api/auth/register` | Đăng ký (trả JWT) |
| POST | `/api/auth/login` | Đăng nhập — set cookie httpOnly `pms_access_token` |
| POST | `/api/auth/logout` | Thu hồi token + xóa cookie |
| GET | `/api/auth/me` | User hiện tại |
| PATCH | `/api/auth/profile` | Đổi tên hiển thị |
| POST | `/api/auth/change-password` | Đổi mật khẩu |

Cấu hình JWT (`application.properties`): `app.jwt.secret`, `app.jwt.access-token-ttl-hours` (mặc định 24h).

---

## API Task (trong project)

| Method | Path | Mô tả |
|--------|------|--------|
| GET/POST | `/api/workspaces/{ws}/projects/{ps}/task-statuses` | Cột Kanban theo dự án (Todo, In Progress, …) |
| PATCH | `.../task-statuses/reorder` | Sắp xếp lại thứ tự cột (kéo thả) |
| GET | `/api/tasks/mine` | Task được gán cho user hiện tại |
| GET | `/api/tasks/mine/summary` | Thống kê task của tôi |
| GET/POST | `/api/workspaces/{ws}/projects/{ps}/tasks` | Danh sách / tạo task |
| GET/PATCH/DELETE | `.../tasks/{id}` | Chi tiết / sửa / xóa mềm |
| PATCH | `.../tasks/{id}/status` | Đổi trạng thái (Kanban) |
| GET/POST | `.../tasks/{id}/comments` | Bình luận |
| GET | `.../tasks/{id}/history` | Lịch sử thay đổi |
| GET/POST | `.../tasks/{id}/attachments` | File đính kèm task |

---

## Cấu hình tùy chọn

Copy file mẫu nếu DB khác mặc định:

```text
pms-backend/src/main/resources/application-local.properties.example
→ application-local.properties
```

Mặc định: `jdbc:postgresql://localhost:5432/pms`, user/pass `postgres` / `postgres`.

Spring Boot tự đọc `application-local.properties` nếu file tồn tại (profile `dev`).

---

## Xử lý lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách xử lý |
|-------------|-------------|------------|
| `FATAL: password authentication failed for user "postgres"` | Máy có **Postgres cài sẵn** khác mật khẩu / backend connect nhầm instance | Xem mục **Postgres xung đột** bên dưới |
| `http proxy error` / ECONNREFUSED khi login | Backend chưa chạy | Chạy bước 2, đợi `Started` |
| 500 `ERR_INTERNAL` | Backend crash / DB lỗi / DevTools reload lỗi | Dừng backend (`Ctrl+C`), chạy lại `.\mvnw.cmd spring-boot:run` |
| Backend không start — lỗi kết nối DB | Postgres chưa lên | `docker compose up -d`, kiểm tra `docker ps` |
| Login 401 `ERR_US_03` | Sai email/mật khẩu | Dùng tài khoản dev ở trên |
| `npm install` lỗi SSL (mạng công ty) | Certificate nội bộ | `npm install --strict-ssl=false` |
| `Port 8080 was already in use` + `BUILD FAILURE` | **Backend đã chạy** (terminal khác / lần chạy trước) — không phải app hỏng | **Không** chạy thêm `spring-boot:run`. Mở http://localhost:5173 và F5. Muốn chạy lại: `taskkill /PID <pid> /F` (PID từ `netstat -ano` cột 8080) rồi chạy **một** lần |
| `BUILD SUCCESS` rồi terminal về `PS>` (backend tự tắt) | DevTools auto-restart trên Windows / chạy nhầm lệnh `install` | Dùng `spring-boot:run`, **git pull** bản mới (đã tắt auto-restart). Terminal phải **treo**, chưa về prompt |

### Kiểm tra DB có mật khẩu dev chưa

```powershell
docker exec pms-postgres psql -U postgres -d pms -c "SELECT id, email, password_hash IS NOT NULL AS has_pw FROM users;"
```

Cột `has_pw` phải là `t` với `admin@ctel.local`.

### Postgres xung đột (password authentication failed)

Máy đã cài **PostgreSQL** (DBeaver, pgAdmin, installer…) thường chiếm cổng **5432** với mật khẩu **khác** `postgres`. Backend repo mặc định user/pass `postgres`/`postgres` → lỗi:

```text
FATAL: password authentication failed for user "postgres"
```

**Cách A — Dùng Docker Postgres của repo (khuyên dùng):**

1. Tắt service Postgres cài sẵn trên Windows (Services → postgresql-x64-… → Stop), **hoặc**
2. Đổi port Docker trong `docker-compose.yml` (vd. `"5433:5432"`) rồi sửa URL trong `application-local.properties`

```powershell
docker compose up -d
docker ps   # pms-postgres phải Up
```

**Cách B — Ghi đè cấu hình riêng máy:**

```powershell
cd pms-backend\src\main\resources
copy application-local.properties.example application-local.properties
# Sửa password/url cho đúng Postgres trên máy bạn
```

Rồi chạy lại `.\mvnw.cmd spring-boot:run`. File `application-local.properties` **không commit** lên Git.

---

### Backend tự tắt sau ~10 giây (không bấm Ctrl+C)

Log có `Started PmsBackendApplication` rồi `Graceful shutdown` + `BUILD SUCCESS` → thường do **Spring DevTools** trên Windows tưởng file trong `target/` đổi và restart app.

Repo đã **tắt auto-restart** trong `application-dev.properties`. Bạn t cần `git pull` rồi chạy lại:

```powershell
cd pms-backend
.\mvnw.cmd spring-boot:run
```

**Đúng:** sau `Tomcat started on port 8080`, terminal vẫn treo, không về dòng `PS>`.

**Sai:** thấy `BUILD SUCCESS` và prompt `PS>` → server đã tắt, frontend login sẽ lỗi.

Nếu vẫn tự tắt, thử chạy main class `PmsBackendApplication` từ IntelliJ thay vì Maven.

### Backend crash sau khi sửa code

Sau khi sửa Java: **dừng** (`Ctrl+C`) rồi chạy lại `spring-boot:run` (không còn hot-reload tự động).

---

## Cấu trúc repo

```text
project-management-system/
├── docker-compose.yml      # PostgreSQL
├── pms-backend/            # Spring Boot 3.5, Java 21, Flyway
├── pms-frontend/           # React 19, Vite, Tailwind 4
└── docs/                   # Tài liệu nghiệp vụ (FRS, SRS, ERD…)
```

Chi tiết frontend: [pms-frontend/README.md](pms-frontend/README.md)

---

## Thứ tự chạy hàng ngày

```text
1. docker compose up -d
2. pms-backend  → .\mvnw.cmd spring-boot:run
3. pms-frontend → npm run dev
```

Luôn đảm bảo backend **đã start xong** trước khi thử đăng nhập trên frontend.
