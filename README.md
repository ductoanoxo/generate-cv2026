# 🏫 Cổng Thông Tin Tây Đô (Tây Đô College Portal & CV Builder)

Dự án xây dựng cổng thông tin trực quan hóa dữ liệu (Dashboard) dành cho cán bộ quản lý, giảng viên và sinh viên Trường Cao Đẳng Tây Đô, tích hợp công cụ tự động tạo CV chuyên nghiệp dựa trên kết quả học tập thực tế.

---

## 🏗️ Kiến Trúc Hệ Thống (Architecture)

Dự án được xây dựng dưới dạng ứng dụng full-stack hoàn chỉnh chia thành hai phần độc lập:

- **Frontend (`/frontend`)**: 
  - Khởi chạy bằng **React + Vite + TypeScript**.
  - Trực quan hóa dữ liệu với **Recharts**, icons đồng bộ từ **Phosphor Icons**.
  - Thiết kế theo chuẩn giao diện tối (Dark mode) sang trọng, áp dụng font chữ **Inter**.
- **Backend (`/backend`)**:
  - Xây dựng trên nền **.NET 8 Web API**, sử dụng **Entity Framework Core**.
  - Kết nối trực tiếp tới cơ sở dữ liệu **Supabase PostgreSQL**.
  - Chế độ hoạt động: 🔒 **Read-Only** (Chỉ đọc & thống kê dữ liệu, không ghi đè, ngoại trừ login).
- **Môi trường chạy**: Container hóa toàn bộ bằng **Docker Compose** hỗ trợ cơ chế **Hot-Reload** tức thì.

---

## 📁 Cấu Trúc Thư Mục

```
generate-cv/
├── backend/                  # Mã nguồn Backend .NET 8 Web API
│   ├── Controllers/          # Các endpoint API phân quyền theo Role
│   ├── Data/                 # Cấu hình DbContext & Database Entities
│   ├── Services/             # Logic nghiệp vụ (Auth, Admin, Student, Teacher...)
│   ├── Middleware/           # Bộ lọc xác thực quyền truy cập Role claim từ JWT
│   └── Dockerfile            # Multi-stage build chạy Hot-Reload qua dotnet watch
│
├── frontend/                 # Giao diện Frontend React + Vite
│   ├── src/
│   │   ├── components/       # Giao diện khung (Layout, Protected Routes)
│   │   ├── context/          # Quản lý phiên đăng nhập (Auth Context)
│   │   ├── mock/             # Dữ liệu giả lập (mockData) khớp 100% database thật
│   │   ├── pages/            # Các trang dashboard theo Role & CV Builder
│   │   ├── App.tsx           # Định tuyến ứng dụng React Router v6
│   │   └── index.css         # Design system & biến cấu trúc CSS (font Inter)
│   ├── nginx.conf            # Cấu hình SPA routing cho Docker production
│   └── Dockerfile            # Dockerfile chạy dev server có auto-reload
│
├── docs/                     # Tài liệu thiết kế & phân chia công việc
│   ├── dashboard_master_plan.md
│   └── work_division.md
│
├── .agents/                  # Cấu hình hoạt động của AI Agents
│   └── rules/
│       └── project_rules.md  # Quy tắc phát triển (UI/UX, Read-Only, Docker...)
│
└── docker-compose.yml        # Tệp quản lý kích hoạt đồng thời 2 dịch vụ
```

---

## 🔐 Phân Quyền Hệ Thống & Tài Khoản Thử Nghiệm

Hệ thống phân quyền dựa trên trường dữ liệu `Role` (số nguyên) trong bảng `Users`. Trang đăng nhập tích hợp sẵn tính năng nhấn chọn nhanh để kiểm thử các Role sau:

| Tài khoản | Họ và Tên | Quyền (Role) | Chức năng chính |
| :--- | :--- | :--- | :--- |
| **admin** | Nguyễn Văn Quản Trị | 99 (Admin) | Thống kê toàn trường, quản lý thiết bị, cấu hình, audit logs |
| **deankhoa** | TS. Trần Minh Khoa | 50 (Trưởng Khoa) | Tiến độ học kỳ khoa, chuyên cần HP, trung bình môn, đánh giá GV |
| **tbm_cntt** | ThS. Nguyễn Thị Trưởng | 20 (Trưởng Bộ Môn) | Tiến độ dạy môn học, đề thi bộ môn, so sánh điểm thi các lớp |
| **gv_nam** | ThS. Lê Hoàng Nam | 10 (Giáo Viên) | Thời khóa biểu giảng dạy, sĩ số lớp, cảnh báo học viên vắng nhiều |
| **sv_toan** | Đặng Đức Toàn | 1 (Sinh Viên) | Dashboard cá nhân, thời khóa biểu học, bảng điểm, **Tạo CV ứng tuyển** |

---

## 📄 Công Cụ Tạo CV Tự Động (CV Builder)

Nằm tại tuyến đường `/student/cv` dành riêng cho sinh viên:
- **Tự động điền (Autofill)**: Thông tin cá nhân (MSSV, ngành, khoa) và kết quả thi được lấy trực tiếp từ cơ sở dữ liệu, đảm bảo tính chính xác và được hệ thống xác thực.
- **Live Preview**: Xem trước CV theo định dạng A4 chuẩn thời gian thực song song với khung soạn thảo.
- **Tùy chỉnh linh hoạt**: Sinh viên tự nhập thêm giới thiệu bản thân, kỹ năng, dự án thực tế và các hoạt động ngoại khóa.
- **Xuất bản**: Hỗ trợ in trực tiếp hoặc lưu file PDF thông qua phím tắt tích hợp `window.print()`.

---

## 🚀 Hướng Dẫn Kích Hoạt & Cài Đặt

### Cách 1: Khởi chạy nhanh bằng Docker Compose (Khuyên Dùng - Có Hot-Reload)

Yêu cầu máy tính đã cài đặt **Docker** và **Docker Compose**. Tại thư mục gốc của dự án, chạy lệnh:

```bash
# Khởi động và build các dịch vụ chạy ngầm
docker compose up -d --build
```

Sau khi các container khởi chạy thành công:
- **Frontend** sẽ mở tại: `http://localhost:3000` (Tự động hot-reload khi sửa code ở thư mục `/frontend`).
- **Backend API** sẽ mở tại: `http://localhost:5000` (Tự động hot-reload qua `dotnet watch` khi sửa code ở thư mục `/backend`).

*Các lệnh Docker hữu ích:*
```bash
# Xem nhật ký logs
docker compose logs -f

# Tắt các container
docker compose down
```

### Cách 2: Khởi chạy thủ công (Local Development)

#### 1. Chạy Backend .NET 8:
Yêu cầu đã cài đặt .NET 8 SDK.
```bash
cd backend
# Cấu hình lại mật khẩu Supabase PostgreSQL trong appsettings.json nếu cần
dotnet run
```
API sẽ hoạt động tại `http://localhost:5080` (hoặc cổng cấu hình ngẫu nhiên).

#### 2. Chạy Frontend React:
Yêu cầu đã cài đặt Node.js (phiên bản v24 trở lên).
```bash
cd frontend
npm install
npm run dev
```
Ứng dụng khách sẽ hoạt động tại `http://localhost:5173`.
