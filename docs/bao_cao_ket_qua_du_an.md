# BÁO CÁO KẾT QUẢ DỰ ÁN

**Dự án:** Hệ thống Cổng Thông Tin & Tạo CV Tự Động — Trường Cao Đẳng Tây Đô  
**Thành viên thực hiện:**
- Đặng Đức Toàn (Developer A)
- Lê Minh Hải (Developer B)

---

## 1. Mục tiêu dự án

Xây dựng một hệ thống Web API và giao diện người dùng (Dashboard) để hiển thị, trực quan hóa các dữ liệu từ database được cung cấp. Hệ thống tích hợp thêm công cụ **Tạo CV tự động** dành cho sinh viên, giúp sinh viên tạo CV chuyên nghiệp dựa trên thông tin cá nhân và kết quả học tập thực tế.

Ứng dụng sử dụng **.NET 8 Web API** làm phần backend để truy xuất dữ liệu, **React + Vite + TypeScript** để xây dựng giao diện frontend, **Docker** để đóng gói ứng dụng và **Supabase PostgreSQL** làm hệ quản trị cơ sở dữ liệu trên Cloud.

Hệ thống hoạt động ở chế độ **Read-Only** (chỉ đọc và thống kê dữ liệu, không ghi đè dữ liệu gốc, ngoại trừ chức năng đăng nhập).

---

## 2. Kiến trúc hệ thống

Dự án được xây dựng dưới dạng ứng dụng full-stack hoàn chỉnh, chia thành hai phần độc lập (Frontend và Backend), được đóng gói chung trong Docker Compose.

```
┌─────────────────────────────────────────────────────────────────┐
│                      Docker Compose                             │
│                                                                 │
│  ┌──────────────────────┐      ┌──────────────────────────┐     │
│  │   Frontend Container │      │   Backend Container      │     │
│  │                      │      │                          │     │
│  │  React + Vite + TS   │ ──── │  .NET 8 Web API          │     │
│  │  Port: 3000          │ HTTP │  Entity Framework Core   │     │
│  │                      │      │  Port: 5000              │     │
│  │  - React Router v6   │      │                          │     │
│  │  - Recharts          │      │  - JWT Authentication    │     │
│  │  - Phosphor Icons    │      │  - Role Authorization    │     │
│  │  - Axios             │      │  - Swagger/OpenAPI       │     │
│  └──────────────────────┘      └────────────┬─────────────┘     │
│                                             │                   │
└─────────────────────────────────────────────┼───────────────────┘
                                              │ Connection String
                                              ▼
                                 ┌──────────────────────┐
                                 │  Supabase PostgreSQL  │
                                 │  (Cloud Database)     │
                                 │                       │
                                 │  37 tables            │
                                 │  665 Users            │
                                 │  577 Students         │
                                 │  93,865 Attendance    │
                                 │  31,079 Exam Results  │
                                 └──────────────────────┘
```

**Luồng hoạt động chính:**

1. Người dùng truy cập giao diện Frontend qua trình duyệt (port 3000).
2. Frontend gửi request đăng nhập tới Backend API (port 5000).
3. Backend xác thực thông tin, trả về **JWT Token** chứa thông tin vai trò (Role).
4. Frontend lưu JWT Token và gửi kèm trong các request tiếp theo.
5. Backend nhận JWT, kiểm tra quyền truy cập (Role), truy vấn dữ liệu từ Supabase PostgreSQL thông qua Entity Framework Core.
6. Dữ liệu được trả về cho Frontend và hiển thị thành biểu đồ, bảng, thẻ KPI.

> [Hình 1: Kiến trúc hệ thống]

---

## 3. Công nghệ sử dụng

| STT | Công nghệ | Mục đích sử dụng |
|:---:|-----------|-------------------|
| 1 | **React** | Xây dựng giao diện người dùng (Frontend) |
| 2 | **Vite** | Build tool cho Frontend, hỗ trợ Hot Module Replacement |
| 3 | **TypeScript** | Ngôn ngữ lập trình cho Frontend, giúp kiểm tra kiểu dữ liệu |
| 4 | **Recharts** | Thư viện biểu đồ (BarChart, PieChart, LineChart, RadarChart, Treemap) |
| 5 | **Phosphor Icons** | Bộ icon đồng bộ cho giao diện |
| 6 | **React Router v6** | Điều hướng và phân quyền trang theo vai trò |
| 7 | **Axios** | Gọi API từ Frontend tới Backend |
| 8 | **.NET 8 Web API** | Xây dựng Backend API, xử lý nghiệp vụ |
| 9 | **Entity Framework Core** | ORM kết nối và truy vấn cơ sở dữ liệu PostgreSQL |
| 10 | **JWT (JSON Web Token)** | Xác thực và phân quyền người dùng |
| 11 | **Swagger / OpenAPI** | Tài liệu hóa API tự động |
| 12 | **Docker** | Đóng gói ứng dụng thành container |
| 13 | **Docker Compose** | Quản lý và khởi chạy đồng thời nhiều container |
| 14 | **Supabase PostgreSQL** | Cloud Database, lưu trữ dữ liệu trên đám mây |
| 15 | **Nginx** | Reverse proxy cho Frontend trong môi trường production |

*Bảng 1: Các công nghệ được sử dụng*

---

## 4. Kết quả thực hiện

### 4.1. Chuẩn bị các môi trường cần thiết

Các bước chuẩn bị môi trường bao gồm:

1. **Restore database từ file backup:** Nhận file backup database từ bên giao đề. Sau khi restore thành công trên SQL Server, tiến hành generate scripts để tạo thành file `.sql`.

2. **Mapping sang PostgreSQL:** Lấy file SQL đã generate, chuyển đổi (mapping) cú pháp từ SQL Server sang PostgreSQL cho tương thích với Supabase. File kết quả: `TayDoV2_schema.sql`.

3. **Tạo project trên Supabase:** Đăng ký và tạo project mới trên Supabase. Import dữ liệu từ file SQL đã mapping vào Supabase PostgreSQL. Database bao gồm **37 bảng** với dữ liệu thực tế (665 Users, 577 Students, 93,865 bản ghi điểm danh, 31,079 kết quả thi).

4. **Khởi tạo cấu trúc project:**
   - Frontend: React + Vite + TypeScript (`/frontend`)
   - Backend: .NET 8 Web API (`/backend`)
   - Cấu hình biến môi trường qua file `.env`

5. **Thiết lập Docker:**
   - Tạo `Dockerfile` cho Frontend (dev server với auto-reload)
   - Tạo `Dockerfile` cho Backend (dotnet watch với Hot-Reload)
   - Tạo `docker-compose.yml` ở thư mục gốc để quản lý 2 container (taydo_frontend và taydo_backend) trong cùng một network (`taydo_network`)

6. **Kết nối và phát triển:** Sau khi hoàn chỉnh môi trường, nhóm kết nối project tới Supabase database thông qua Connection String và bắt đầu xây dựng các chức năng hiển thị.

**Cấu trúc thư mục dự án:**

```
generate-cv2026/
├── backend/                  # Mã nguồn Backend .NET 8 Web API
│   ├── Controllers/          # Các endpoint API (10 controllers)
│   ├── Services/             # Logic nghiệp vụ (Auth, Admin, Student, Teacher...)
│   ├── Data/                 # Cấu hình DbContext & Database Entities
│   ├── DTOs/                 # Data Transfer Objects
│   ├── Middleware/            # Middleware xác thực quyền truy cập Role
│   ├── Helpers/              # Các hàm hỗ trợ (PasswordHelper...)
│   └── Dockerfile
│
├── frontend/                 # Giao diện Frontend React + Vite
│   ├── src/
│   │   ├── pages/            # Các trang dashboard theo Role & CV Builder
│   │   ├── components/       # Components dùng chung (Layout, ProtectedRoute)
│   │   ├── context/          # Quản lý phiên đăng nhập (AuthContext)
│   │   ├── mock/             # Dữ liệu mock fallback khi mất kết nối
│   │   ├── utils/            # Các hàm tiện ích
│   │   ├── App.tsx           # Định tuyến ứng dụng
│   │   └── index.css         # Design system (dark theme, font Inter)
│   ├── nginx.conf            # Cấu hình SPA routing cho production
│   └── Dockerfile
│
├── docs/                     # Tài liệu thiết kế & phân chia công việc
├── docker-compose.yml        # Quản lý khởi chạy đồng thời 2 dịch vụ
└── .env                      # Biến môi trường (Connection String, Supabase keys)
```

---

### 4.2. Hệ thống phân quyền

Hệ thống phân quyền dựa trên trường dữ liệu `Role` (số nguyên) trong bảng `Users`. Mỗi vai trò có phạm vi truy cập dữ liệu khác nhau:

| Mã Role | Vai trò | Tài khoản thử nghiệm | Phạm vi dữ liệu |
|:-------:|---------|----------------------|------------------|
| **99** | Admin (Quản trị viên) | `admin1` | Toàn bộ hệ thống: thống kê toàn trường, quản lý thiết bị, cấu hình, nhật ký hoạt động |
| **50** | Trưởng Khoa | `deankhoa` | Cấp khoa: tiến độ học kỳ, chuyên cần, điểm trung bình, đánh giá giảng viên, danh sách GV |
| **20** | Trưởng Bộ Môn | `tbm_cntt` | Cấp bộ môn: tiến độ giảng dạy, ngân hàng câu hỏi, so sánh điểm giữa các lớp |
| **10** | Giảng viên | `giaovien1` | Cá nhân: lịch dạy, danh sách lớp, sĩ số, cảnh báo sinh viên vắng nhiều |
| **1** | Sinh viên | `sv_toan` | Cá nhân: dashboard, thời khóa biểu, bảng điểm, thông báo, tạo CV |

*Bảng 2: Hệ thống phân quyền và tài khoản thử nghiệm*

Trang đăng nhập tích hợp sẵn tính năng **nhấn chọn nhanh tài khoản demo** để kiểm thử các vai trò khác nhau mà không cần nhập tay.

---

### 4.3. Xây dựng các API

Hệ thống cung cấp **36 API endpoints** RESTful phục vụ cho các trang Dashboard, được chia thành **10 nhóm Controller**. Toàn bộ API hoạt động ở chế độ **Read-Only** (chỉ đọc), ngoại trừ API đăng nhập.

#### 4.3.1. Authentication API (`/api/auth`)

| STT | API | Method | Chức năng |
|:---:|-----|:------:|-----------|
| 1 | `/api/auth/login` | POST | Đăng nhập hệ thống — nhận username/password, trả về JWT Token chứa thông tin vai trò |
| 2 | `/api/auth/me` | GET | Lấy thông tin người dùng hiện tại từ JWT Token |

*Bảng 3: Authentication API*

#### 4.3.2. Admin Dashboard API (`/api/admin`)

| STT | API | Method | Chức năng |
|:---:|-----|:------:|-----------|
| 3 | `/api/admin/dashboard` | GET | Thống kê KPIs toàn trường (tổng sinh viên, giảng viên, khoa, môn học), phân bố sinh viên theo khoa/khóa, xu hướng điểm danh theo tháng, phân bố phổ điểm thi |
| 4 | `/api/admin/audit-logs` | GET | Lấy nhật ký hoạt động hệ thống gần đây (hỗ trợ tham số `limit`) |
| 5 | `/api/admin/devices` | GET | Thống kê phân bố thiết bị đã đăng ký (Desktop, Mobile, Tablet) |
| 6 | `/api/admin/devices/list` | GET | Lấy danh sách chi tiết thiết bị người dùng (hỗ trợ tham số `limit`) |
| 7 | `/api/admin/settings` | GET | Xem các thiết lập cấu hình hệ thống (năm học, học kỳ, tích hợp...) |

*Bảng 4: Admin Dashboard API*

#### 4.3.3. Schedule API (`/api/schedule`)

| STT | API | Method | Chức năng |
|:---:|-----|:------:|-----------|
| 8 | `/api/schedule/today` | GET | Lấy lịch học/dạy hôm nay — tự nhận diện từ JWT hoặc qua tham số `userId`, `role`, `date` |
| 9 | `/api/schedule/by-week` | GET | Lấy lịch tuần (Thứ 2 – Chủ nhật) — hỗ trợ tham số `userId`, `role`, `date` |
| 10 | `/api/schedule/student/{id}` | GET | Lấy thời khóa biểu sinh viên theo ID, hỗ trợ lọc theo `semesterId` |
| 11 | `/api/schedule/teacher/{id}` | GET | Lấy thời khóa biểu giảng dạy của giảng viên, hỗ trợ lọc theo `semesterId` |
| 12 | `/api/schedule/faculty/{id}` | GET | Lấy lịch giảng dạy toàn khoa theo Faculty ID |
| 13 | `/api/schedule/semesters` | GET | Lấy danh sách tất cả học kỳ trong hệ thống |

*Bảng 5: Schedule API*

#### 4.3.4. Student Dashboard API (`/api/student`)

| STT | API | Method | Chức năng |
|:---:|-----|:------:|-----------|
| 14 | `/api/student/dashboard` | GET | Tổng quan dashboard sinh viên (thông tin cá nhân, GPA, tín chỉ, lịch hôm nay, điểm gần đây) |
| 15 | `/api/student/profile` | GET | Thông tin chi tiết hồ sơ sinh viên |
| 16 | `/api/student/announcements` | GET | Danh sách thông báo dành cho sinh viên |
| 17 | `/api/student/scores` | GET | Bảng điểm sinh viên theo từng học kỳ (điểm thành phần, điểm tổng kết) |
| 18 | `/api/student/exams` | GET | Kết quả các kỳ thi của sinh viên |

*Bảng 6: Student Dashboard API*

#### 4.3.5. Teacher Dashboard API (`/api/teacher`)

| STT | API | Method | Chức năng |
|:---:|-----|:------:|-----------|
| 19 | `/api/teacher/dashboard` | GET | Tổng quan dashboard giảng viên (KPI, lịch dạy hôm nay, thống kê lớp, cảnh báo) |
| 20 | `/api/teacher/classes` | GET | Danh sách các lớp đang giảng dạy (mã môn, tên, sĩ số, số buổi đã dạy) |
| 21 | `/api/teacher/alerts` | GET | Danh sách sinh viên cần cảnh báo (vắng nhiều, kết quả thấp) |
| 22 | `/api/teacher/question-suites` | GET | Ngân hàng bộ đề thi của giảng viên (theo môn, phân loại dễ/vừa/khó) |

*Bảng 7: Teacher Dashboard API*

#### 4.3.6. Faculty Dashboard API (`/api/faculty`)

| STT | API | Method | Chức năng |
|:---:|-----|:------:|-----------|
| 23 | `/api/faculty/dashboard` | GET | Tổng quan dashboard trưởng khoa (KPI, chuyên cần, điểm trung bình, đánh giá GV) |
| 24 | `/api/faculty/teachers` | GET | Danh sách giảng viên trong khoa (tên, học vị, email, chức vụ) |
| 25 | `/api/faculty/attendance` | GET | Thống kê tỷ lệ chuyên cần toàn khoa theo lớp |

*Bảng 8: Faculty Dashboard API*

#### 4.3.7. Department Dashboard API (`/api/department`)

| STT | API | Method | Chức năng |
|:---:|-----|:------:|-----------|
| 26 | `/api/department/dashboard` | GET | Tổng quan dashboard trưởng bộ môn (KPI, tiến độ giảng dạy, so sánh điểm) |
| 27 | `/api/department/progress` | GET | Tiến độ giảng dạy chi tiết theo từng môn học (số buổi đã dạy/tổng) |
| 28 | `/api/department/questions` | GET | Ngân hàng câu hỏi của bộ môn (phân loại theo độ khó) |

*Bảng 9: Department Dashboard API*

#### 4.3.8. Attendance API (`/api/attendance`)

| STT | API | Method | Chức năng |
|:---:|-----|:------:|-----------|
| 29 | `/api/attendance/stats` | GET | Thống kê chuyên cần — hỗ trợ lọc theo `classId`, `studentId` |
| 30 | `/api/attendance/heatmap/{classId}` | GET | Dữ liệu heatmap điểm danh theo lớp (ma trận sinh viên × buổi học) |
| 31 | `/api/attendance/recent` | GET | Lấy nhật ký điểm danh gần đây (hỗ trợ tham số `limit`) |

*Bảng 10: Attendance API*

#### 4.3.9. Exam API (`/api/exams`)

| STT | API | Method | Chức năng |
|:---:|-----|:------:|-----------|
| 32 | `/api/exams/distribution` | GET | Phân bố điểm thi — hỗ trợ lọc theo `subjectId` |
| 33 | `/api/exams/results/student/{id}` | GET | Kết quả thi chi tiết của một sinh viên |

*Bảng 11: Exam API*

#### 4.3.10. Report API (`/api/reports`)

| STT | API | Method | Chức năng |
|:---:|-----|:------:|-----------|
| 34 | `/api/reports/cv-data/{studentId}` | GET | Lấy dữ liệu CV của sinh viên (thông tin cá nhân, kết quả học tập) phục vụ tạo CV |
| 35 | `/api/reports/attendance/export` | GET | Xuất báo cáo điểm danh dưới dạng file Excel (.xlsx) — tham số `classId` |
| 36 | `/api/reports/exams/export` | GET | Xuất báo cáo kết quả thi dưới dạng file Excel (.xlsx) — tham số `subjectId` |

*Bảng 12: Report API*

**Tổng kết API:**

| Chỉ số | Giá trị |
|--------|---------|
| Tổng số API endpoints | **36** |
| Phương thức GET | 35 |
| Phương thức POST | 1 (chỉ login) |
| Số Controller | 10 |
| Xác thực | JWT Bearer Token |
| Chế độ hoạt động | Read-Only (ngoại trừ login) |

---

### 4.4. Giao diện người dùng

Hệ thống gồm **19 trang giao diện**, được thiết kế theo phong cách **dark theme** hiện đại với tone màu tối (#0a0e1a, #111827), điểm nhấn xanh lá (#22C55E), sử dụng font **Inter** và hiệu ứng **glassmorphism**.

Mỗi vai trò có layout riêng với **sidebar điều hướng** chứa các menu tương ứng, **header** hiển thị tên người dùng và vai trò, và nút **đăng xuất**.

Tất cả các trang đều có cơ chế **resilient fallback**: nếu Backend API offline, trang sẽ tự động hiển thị dữ liệu mock với badge trạng thái (xanh = "Dữ liệu Live", vàng = "Dữ liệu Mock").

---

#### 4.4.1. Màn hình Đăng nhập (Login)

**Đường dẫn:** `/login`

**Mô tả:**
- Giao diện đăng nhập với thiết kế **glassmorphism** trên nền gradient động.
- Hiển thị logo và tên trường "TÂY ĐÔ COLLEGE".
- Có 2 ô nhập liệu: **Tên đăng nhập** và **Mật khẩu** (có nút ẩn/hiện mật khẩu).
- Nút **"Đăng nhập"** với hiệu ứng loading spinner khi đang xử lý.
- Khu vực **chọn nhanh tài khoản demo** hiển thị dạng lưới 2 cột, mỗi thẻ gồm: tên tài khoản, vai trò, avatar icon. Nhấn vào sẽ tự động điền thông tin đăng nhập.
- Hiển thị thông báo lỗi với viền đỏ khi đăng nhập thất bại.
- Sau khi đăng nhập thành công, tự động chuyển hướng đến dashboard tương ứng theo vai trò.

**API sử dụng:**
- `POST /api/auth/login` — Xác thực tài khoản, nhận JWT Token.

> [Hình 2: Màn hình đăng nhập]

---

#### 4.4.2. Màn hình của Sinh viên

##### a) Dashboard Sinh viên

**Đường dẫn:** `/student`

**Mô tả:**
- **Header chào mừng** hiển thị tên sinh viên và avatar.
- **Thẻ thông tin cá nhân:** Avatar, họ tên, MSSV, ngành học, khóa, ngày sinh, giới tính, CCCD, số điện thoại, quê quán, GPA tích lũy. Có nút **"Tạo CV"** liên kết đến trang CV Builder.
- **Lịch học hôm nay:** Danh sách các buổi học trong ngày gồm: tên môn, phòng, lớp, tiết học.
- **Biểu đồ chuyên cần (Donut Chart):** Thống kê tỷ lệ có mặt, trễ, vắng có phép, vắng không phép kèm bảng chi tiết số buổi.
- **Kết quả học tập:** Dropdown chọn học kỳ, biểu đồ đường (Line Chart) điểm theo mã môn, bảng điểm chi tiết (mã môn, số tín chỉ, điểm tổng kết).
- **Badge trạng thái kết nối** (Live/Mock).

**API sử dụng:**
- `GET /api/student/dashboard` — Lấy dữ liệu tổng quan (profile, lịch hôm nay, chuyên cần, kết quả thi).
- `GET /api/student/scores` — Lấy bảng điểm chi tiết theo học kỳ.

> [Hình 3: Dashboard sinh viên]

---

##### b) Thông báo Sinh viên

**Đường dẫn:** `/student/announcements`

**Mô tả:**
- **Tiêu đề trang** "Thông Báo" với icon chuông.
- **Danh sách thông báo** dạng thẻ, mỗi thông báo gồm: nội dung tin nhắn và ngày tạo.
- **Phân trang:** Hiển thị 10 thông báo mỗi trang với nút Trước/Sau.
- Hiển thị trạng thái trống khi không có thông báo.

**API sử dụng:**
- `GET /api/student/announcements` — Lấy danh sách thông báo của sinh viên.

> [Hình 4: Màn hình thông báo sinh viên]

---

##### c) Xem điểm (Bảng điểm)

**Đường dẫn:** `/student/scores`

**Mô tả:**
- **Tiêu đề trang** "Bảng Điểm".
- **Dropdown chọn học kỳ:** Lọc theo từng học kỳ hoặc xem tất cả.
- **Bảng điểm theo học kỳ:** Mỗi học kỳ hiển thị thành panel riêng với GPA của kỳ đó. Các cột bao gồm: STT, Mã môn, Tên môn, Số tín chỉ, Điểm hệ 10, Điểm hệ 4, Xếp loại (A/B/C/D/F), Kết quả (✓ đạt / ✗ không đạt).
- **Điểm được tô màu:** Xanh cho môn đạt (≥5), đỏ cho môn không đạt (<5).
- **Modal chi tiết điểm:** Khi nhấn nút "Chi tiết" của một môn, hiển thị popup gồm: thông tin môn học, bảng điểm thành phần (tên cột điểm, trọng số %, điểm số), và kết quả tổng kết.

**API sử dụng:**
- `GET /api/student/scores` — Lấy bảng điểm đầy đủ tất cả học kỳ.

> [Hình 5: Màn hình xem điểm sinh viên]

---

##### d) Thời khóa biểu Sinh viên

**Đường dẫn:** `/student/schedule`

**Mô tả:**
- **Tiêu đề trang** "Thời Khóa Biểu".
- **Bộ lọc:** Dropdown chọn Học kỳ và Tuần.
- **Điều hướng tuần:** Nút mũi tên ◀ / ▶ để chuyển tuần trước/tuần sau, hiển thị khoảng ngày của tuần hiện tại.
- **Lưới lịch tuần (Calendar Grid):** Hiển thị 7 ngày (Thứ 2 – Chủ nhật) × 12 tiết học. Mỗi buổi học hiển thị dạng thẻ màu gồm: tên môn, mã lớp, phòng học.
- **Chỉ báo ngày hiện tại:** Cột ngày hôm nay được tô nổi bật.
- Lọc lịch theo khoảng ngày của tuần đã chọn dựa trên `startDateTime`.

**API sử dụng:**
- `GET /api/schedule/semesters` — Lấy danh sách học kỳ cho dropdown.
- `GET /api/schedule/student/{studentId}?semesterId={id}` — Lấy thời khóa biểu sinh viên theo học kỳ.

> [Hình 6: Thời khóa biểu sinh viên]

---

##### e) Tạo CV (CV Builder)

**Đường dẫn:** `/student/cv`

**Mô tả:**
- **Bố cục chia đôi màn hình (Split-pane):** Cột trái là **form biên tập**, cột phải là **xem trước CV thời gian thực** theo định dạng A4 chuẩn.
- **Phần thông tin cá nhân:** Họ tên, số điện thoại, email, quê quán — có thể chỉnh sửa.
- **Phần mục tiêu nghề nghiệp:** Textarea để sinh viên nhập mục tiêu/giới thiệu bản thân.
- **Phần kỹ năng:** Thêm/xóa các tag kỹ năng.
- **Phần ngôn ngữ:** Thêm/xóa các tag ngôn ngữ.
- **Phần dự án:** Thêm dự án với thông tin: tên dự án, vai trò, mô tả, công nghệ sử dụng.
- **Phần hoạt động ngoại khóa:** Thêm/xóa các hoạt động.
- **Chọn xếp loại học lực:** Checkbox chọn xếp loại để hiển thị trên CV.
- **Nút hành động:**
  - "Xuất PDF / In" — sử dụng `window.print()` với CSS `@media print` tối ưu.
  - "Lưu CV" — lưu tạm (local) với animation thành công.
- Bản xem trước CV cập nhật **thời gian thực** khi người dùng nhập liệu.

**Lưu ý:** Phần này nhóm chỉ mới xây dựng **giao diện cơ bản** (sử dụng dữ liệu mock local). Chưa kết nối với Backend API (`/api/reports/cv-data/{studentId}`) để tự động điền thông tin từ database. Chức năng auto-fill từ dữ liệu thực sẽ được phát triển trong giai đoạn tiếp theo.

**API dự kiến sử dụng (chưa kết nối):**
- `GET /api/reports/cv-data/{studentId}` — Lấy dữ liệu CV từ database (đã có sẵn ở Backend).

> [Hình 7: Giao diện tạo CV]

---

#### 4.4.3. Màn hình của Giảng viên

##### a) Dashboard Giảng viên

**Đường dẫn:** `/teacher`

**Mô tả:**
- **Badge trạng thái kết nối** (Live API / Mock Fallback).
- **3 thẻ KPI:** Số lớp đang dạy, Số tiết dạy hôm nay, Số sinh viên cần cảnh báo.
- **Bảng danh sách lớp:** Mã môn, tên môn, mã lớp, số buổi đã hoàn thành, sĩ số.
- **Lịch dạy hôm nay:** Danh sách các buổi dạy trong ngày gồm: tên môn, lớp, phòng, khoảng tiết.
- **Biểu đồ chuyên cần (Donut Chart):** Phân bố có mặt/trễ/vắng có phép/vắng không phép.
- **Danh sách sinh viên cảnh báo:** Tên, lớp, lý do cảnh báo (tô đỏ), badge trạng thái (Warning/Notice). Danh sách hỗ trợ phân trang (chỉ hiển thị tối đa 5 sinh viên trên mỗi trang) kèm 2 nút "Trước" và "Sau" giúp tối ưu hóa không gian hiển thị của giao diện.

**API sử dụng:**
- `GET /api/teacher/dashboard` — Lấy toàn bộ dữ liệu dashboard giảng viên.

> [Hình 8: Dashboard giảng viên]

---

##### b) Lịch dạy (Teaching Schedule)

**Đường dẫn:** `/teacher/schedule`

**Mô tả:**
- **Tiêu đề trang** "Lịch Dạy".
- **Bộ lọc:** Dropdown chọn Học kỳ và Tuần.
- **Điều hướng tuần:** Nút mũi tên ◀ / ▶ để chuyển tuần, hiển thị khoảng ngày.
- **Lưới lịch tuần:** 7 ngày × 12 tiết, mỗi buổi dạy hiển thị dạng thẻ màu gồm: tên môn, mã lớp, phòng học.
- Tương tự giao diện thời khóa biểu sinh viên nhưng hiển thị lịch giảng dạy.

**API sử dụng:**
- `GET /api/schedule/semesters` — Lấy danh sách học kỳ.
- `GET /api/schedule/teacher/{teacherId}?semesterId={id}` — Lấy lịch dạy theo học kỳ.

> [Hình 9: Lịch dạy giảng viên]

---

##### c) Ngân hàng đề thi (Exam Bank)

**Đường dẫn:** `/teacher/exams`

**Mô tả:**
- **Tiêu đề trang** "Ngân Hàng Đề Thi".
- **Bảng ngân hàng đề:** Các cột gồm: Mã môn, Tên môn, Số câu Dễ, Số câu Vừa, Số câu Khó, Tổng số câu.
- Mỗi bộ đề hiển thị badge trạng thái **"Sẵn sàng"** (Ready).
- Dữ liệu được lọc theo giảng viên đang đăng nhập.

**API sử dụng:**
- `GET /api/teacher/question-suites` — Lấy ngân hàng bộ đề thi của giảng viên.

> [Hình 10: Ngân hàng đề thi giảng viên]

---

#### 4.4.4. Màn hình của Trưởng Khoa

##### a) Dashboard Trưởng Khoa

**Đường dẫn:** `/faculty`

**Mô tả:**
- **Header chào mừng** hiển thị tên trưởng khoa và tên khoa (ví dụ: "Khoa Công nghệ thông tin").
- **4 thẻ KPI:** Tổng sinh viên trong khoa, Tổng giảng viên, Số ngành, Số môn học.
- **Thanh tiến độ học kỳ (Progress Bar):** Hiển thị phần trăm tiến độ học kỳ hiện tại.
- **Biểu đồ chuyên cần theo lớp (Stacked Bar Chart):** Tỷ lệ có mặt/trễ/vắng theo từng lớp học phần.
- **Biểu đồ đánh giá giảng viên (Radar Chart):** Đánh giá đa tiêu chí từ sinh viên.
- **Biểu đồ điểm trung bình theo môn (Horizontal Bar Chart):** So sánh điểm trung bình giữa các môn trong khoa.
- **Bảng danh sách giảng viên:** Tên + avatar, học vị, email, badge Trưởng khoa/Thành viên.
- **Lưới lịch tuần toàn khoa:** 5 ngày × 10 tiết, hiển thị tất cả lớp học trong khoa (tên môn, mã lớp, phòng, giảng viên).

**API sử dụng:**
- `GET /api/faculty/dashboard?facultyId={id}` — Lấy dữ liệu dashboard khoa (KPI, chuyên cần, điểm, đánh giá GV, danh sách GV).
- `GET /api/schedule/faculty/{facultyId}` — Lấy lịch giảng dạy toàn khoa.

**Các trang phụ:**
- **Danh sách giảng viên** (`/faculty/teachers`): Bảng đầy đủ thông tin GV trong khoa.
  - API: `GET /api/faculty/teachers?facultyId={id}`
- **Thống kê chuyên cần** (`/faculty/attendance`): Bảng nhật ký điểm danh gần đây + biểu đồ Stacked Bar theo lớp.
  - API: `GET /api/attendance/recent`, `GET /api/faculty/dashboard?facultyId={id}`

> [Hình 11: Dashboard trưởng khoa]

---

#### 4.4.5. Màn hình của Trưởng Bộ Môn

##### a) Dashboard Trưởng Bộ Môn

**Đường dẫn:** `/department`

**Mô tả:**
- **Header chào mừng** hiển thị tên trưởng bộ môn và tên bộ môn (ví dụ: "Bộ môn Công nghệ thông tin").
- **3 thẻ KPI:** Tổng sinh viên bộ môn, Số lớp học phần quản lý, Số môn học bộ môn.
- **Tiến độ giảng dạy (Progress Bars):** Thanh tiến độ cho từng môn học, hiển thị số buổi đã dạy/tổng số buổi kèm phần trăm.
- **Biểu đồ so sánh điểm giữa các lớp (Grouped Bar Chart):** So sánh điểm thi giữa các lớp cùng môn (ví dụ: IT21A, IT21B, IT21C).
- **Bảng ngân hàng câu hỏi:** Mã môn, tên môn, số câu Dễ/Vừa/Khó, ngày cập nhật cuối.
- **Heatmap điểm danh (Attendance Heatmap Matrix):** Ma trận màu sắc sinh viên × buổi học, với dropdown chọn lớp. Ký hiệu: V=Có mặt, T=Trễ, P=Vắng có phép, K=Vắng không phép.

**API sử dụng:**
- `GET /api/department/dashboard?departmentId={id}` — Lấy dữ liệu dashboard bộ môn (KPI, tiến độ, so sánh điểm).
- `GET /api/department/questions?departmentId={id}` — Lấy ngân hàng câu hỏi bộ môn.
- `GET /api/attendance/heatmap/{classId}` — Lấy dữ liệu heatmap điểm danh (chuyển đổi theo lớp được chọn).

**Các trang phụ:**
- **Tiến độ giảng dạy** (`/department/progress`): Chi tiết tiến độ từng môn với thanh tiến độ và số buổi.
  - API: `GET /api/department/dashboard?departmentId={id}`
- **Ngân hàng câu hỏi** (`/department/questions`): Bảng đầy đủ ngân hàng câu hỏi.
  - API: `GET /api/department/questions?departmentId={id}`

> [Hình 12: Dashboard trưởng bộ môn]

---

#### 4.4.6. Màn hình của Admin

##### a) Dashboard Admin

**Đường dẫn:** `/admin`

**Mô tả:**
- **Badge trạng thái kết nối** (Live/Mock).
- **4 thẻ KPI:** Tổng sinh viên, Tổng giảng viên, Tổng khoa, Tổng ngành.
- **Biểu đồ Treemap:** Phân bố sinh viên theo Khoa/Ngành.
- **Biểu đồ cột nhóm (Grouped Bar Chart):** Phân bố sinh viên theo Khóa & Giới tính (Nam/Nữ).
- **Biểu đồ đường đa tuyến (Multi-line Chart):** Xu hướng điểm danh theo tháng (Có mặt/Trễ/Vắng có phép/Vắng không phép).
- **Biểu đồ Donut:** Phân bố chuyên cần tổng thể với phần trăm trung tâm.
- **Heatmap kết quả thi:** Ma trận kết quả thi theo Khoa, phân loại: Kém/Yếu/Trung bình/Khá/Giỏi.
- **Biểu đồ cột phân bố điểm (Histogram):** Phổ điểm thi toàn trường.
- **3 panel phụ ở cuối trang:**
  - Nhật ký hoạt động gần đây (link đến `/admin/logs`)
  - Biểu đồ Donut thiết bị đã đăng ký (link đến `/admin/devices`)
  - Cấu hình hệ thống — 11 mục (link đến `/admin/settings`)

**API sử dụng:**
- `GET /api/admin/dashboard` — Lấy KPIs, phân bố sinh viên, xu hướng điểm danh, phổ điểm.
- `GET /api/admin/audit-logs?limit=5` — Lấy 5 nhật ký hoạt động gần nhất.
- `GET /api/admin/devices` — Lấy thống kê phân bố thiết bị.
- `GET /api/admin/settings` — Lấy cấu hình hệ thống.

**Các trang phụ:**
- **Nhật ký hoạt động** (`/admin/logs`): Bảng dữ liệu đầy đủ gồm: ID, Thời gian, Tài khoản, Hành động, Địa chỉ IP.
  - API: `GET /api/admin/audit-logs?limit=50`
- **Quản lý thiết bị** (`/admin/devices`): Bố cục 2 cột — trái là bảng danh sách thiết bị (tên, user, OS/Browser, IP/Time), phải là biểu đồ Donut phân bố loại thiết bị.
  - API: `GET /api/admin/devices`, `GET /api/admin/devices/list`
- **Cấu hình hệ thống** (`/admin/settings`): Hiển thị 11 mục cấu hình (chỉ đọc) với tô màu xanh/đỏ cho giá trị bật/tắt. Các mục: năm học, học kỳ, hạn đăng ký, tín chỉ tốt nghiệp tối thiểu, chế độ bảo trì, tần suất backup, giới hạn API, tích hợp Moodle, SMS Gateway, Email Notification...
  - API: `GET /api/admin/settings`

> [Hình 13: Dashboard admin]

---

### 4.5. Tổng hợp các trang giao diện

| STT | Vai trò | Trang | Đường dẫn |
|:---:|---------|-------|-----------|
| 1 | Chung | Đăng nhập | `/login` |
| 2 | Sinh viên | Dashboard | `/student` |
| 3 | Sinh viên | Thông báo | `/student/announcements` |
| 4 | Sinh viên | Bảng điểm | `/student/scores` |
| 5 | Sinh viên | Thời khóa biểu | `/student/schedule` |
| 6 | Sinh viên | Tạo CV | `/student/cv` |
| 7 | Giảng viên | Dashboard | `/teacher` |
| 8 | Giảng viên | Lịch dạy | `/teacher/schedule` |
| 9 | Giảng viên | Ngân hàng đề thi | `/teacher/exams` |
| 10 | Trưởng Khoa | Dashboard | `/faculty` |
| 11 | Trưởng Khoa | Danh sách GV | `/faculty/teachers` |
| 12 | Trưởng Khoa | Thống kê chuyên cần | `/faculty/attendance` |
| 13 | Trưởng Bộ Môn | Dashboard | `/department` |
| 14 | Trưởng Bộ Môn | Tiến độ giảng dạy | `/department/progress` |
| 15 | Trưởng Bộ Môn | Ngân hàng câu hỏi | `/department/questions` |
| 16 | Admin | Dashboard | `/admin` |
| 17 | Admin | Nhật ký hoạt động | `/admin/logs` |
| 18 | Admin | Quản lý thiết bị | `/admin/devices` |
| 19 | Admin | Cấu hình hệ thống | `/admin/settings` |

*Bảng 13: Tổng hợp các trang giao diện*

---

### 4.6. Phân chia công việc

Dự án được thực hiện bởi 2 thành viên, phân chia theo tính năng và module:

| Thành viên | Công việc phụ trách |
|------------|---------------------|
| **Đặng Đức Toàn** (Dev A) | Thiết lập project & Docker, Migration database (SQL Server → PostgreSQL/Supabase), Hệ thống xác thực JWT, Admin Dashboard (Backend + Frontend), Faculty/Dean Dashboard (Backend + Frontend), Department Dashboard (Backend + Frontend), Schedule API, Swagger/OpenAPI |
| **Lê Minh Hải** (Dev B) | Student Dashboard (Backend + Frontend), Student Scores, Student Schedule, Student Announcements, CV Builder, Teacher Dashboard (Backend + Frontend), Teacher Schedule, Teacher Exam Bank, Attendance API, Exam API, Report API |

*Bảng 14: Phân chia công việc*

---

## 5. Kết luận

### Kết quả đạt được

- ✅ Xây dựng thành công hệ thống Web API với **36 endpoints** RESTful phục vụ truy xuất dữ liệu.
- ✅ Phát triển **19 trang giao diện** dashboard phân quyền theo 5 vai trò người dùng.
- ✅ Triển khai hệ thống xác thực **JWT** với phân quyền dựa trên Role.
- ✅ Trực quan hóa dữ liệu thực tế từ database (665 Users, 577 Students, 93,865 bản ghi điểm danh, 31,079 kết quả thi) thông qua các biểu đồ đa dạng (Bar, Line, Pie, Donut, Radar, Treemap, Heatmap).
- ✅ Container hóa toàn bộ ứng dụng bằng **Docker Compose** với Hot-Reload.
- ✅ Thiết kế giao diện dark theme hiện đại, responsive, có cơ chế fallback khi mất kết nối.
- ✅ Tạo giao diện cơ bản cho công cụ **CV Builder** (chưa kết nối API).

### Hạn chế và hướng phát triển

- ⏳ **CV Builder** hiện chỉ có giao diện cơ bản, chưa kết nối với API Backend (`/api/reports/cv-data`) để auto-fill dữ liệu thực từ database. Cần phát triển thêm trong giai đoạn tiếp theo.
- ⏳ Chưa triển khai **Row Level Security (RLS)** ở tầng database — hiện phân quyền chỉ thực hiện ở tầng API middleware.
- ⏳ Chức năng xuất báo cáo Excel (Report API) đã có endpoint nhưng chưa được tích hợp trên giao diện.
- ⏳ Có thể mở rộng thêm các tính năng: thông báo real-time, export PDF cho CV, tích hợp Supabase Auth thay thế custom JWT.
