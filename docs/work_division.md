# 👥 Phân Công Chi Tiết 2 Developer — Backend .NET 8 (READ-ONLY)

Bản phân công này ánh xạ toàn bộ các chức năng, biểu đồ và nghiệp vụ từ **[dashboard_master_plan.md](file:///home/traductoan/generate-cv/docs/dashboard_master_plan.md)** vào các Task cụ thể của 2 developer trên backend .NET 8 Web API.

---

## 📁 Cấu Trúc File & Quyền Sở Hữu

```
GenerateCV.API/
├── Controllers/
│   ├── AuthController.cs                 ← Dev A (Đăng nhập bằng Users table, verify hash)
│   ├── AdminDashboardController.cs       ← Dev A (KPIs, SV Khoa/Khóa, Điểm danh trend, AuditLogs, Settings, Devices)
│   ├── FacultyDashboardController.cs     ← Dev A (KPIs Khoa, Lịch dạy khoa, GV của khoa, Đánh giá GV, Tiến độ kỳ)
│   ├── DepartmentDashboardController.cs  ← Dev A (KPIs Bộ môn, Tiến độ môn, Ngân hàng đề, So sánh điểm lớp)
│   ├── ScheduleController.cs             ← Dev A (TKB cho cá nhân, TKB cho khoa, TKB cho bộ môn)
│   │
│   ├── TeacherDashboardController.cs     ← Dev B (Lớp đang dạy, Lịch hôm nay, Xem đề thi, SV cần chú ý)
│   ├── StudentDashboardController.cs     ← Dev B (Profile, Điểm cá nhân, Điểm danh cá nhân, Thông báo)
│   ├── AttendanceController.cs           ← Dev B (Điểm danh chi tiết, stats, trend, heatmap matrix)
│   ├── ExamController.cs                 ← Dev B (Điểm thi, phân bố điểm, kết quả thi theo môn, attempts)
│   └── ReportController.cs               ← Dev B (Xuất Excel/PDF điểm danh, bảng điểm, CV data)
│
├── Data/
│   ├── AppDbContext.cs                   ← Dev A setup (Cả 2 dùng)
│   └── Entities/                         ← Dev A scaffold (Cả 2 dùng - 37 public tables)
│
├── DTOs/ (Phân chia theo Controller sở hữu)
│   ├── Auth/                             ← Dev A
│   ├── Admin/                            ← Dev A
│   ├── Faculty/                          ← Dev A
│   ├── Department/                       ← Dev A
│   │
│   ├── Teacher/                          ← Dev B
│   ├── Student/                          ← Dev B
│   ├── Attendance/                       ← Dev B
│   ├── Exam/                             ← Dev B
│   └── Report/                           ← Dev B
│
├── Services/ (Phân chia logic xử lý)
│   ├── AuthService.cs                    ← Dev A
│   ├── AdminDashboardService.cs          ← Dev A
│   ├── FacultyDashboardService.cs        ← Dev A
│   ├── DepartmentDashboardService.cs     ← Dev A
│   ├── ScheduleService.cs                ← Dev A
│   │
│   ├── TeacherDashboardService.cs        ← Dev B
│   ├── StudentDashboardService.cs        ← Dev B
│   ├── AttendanceService.cs              ← Dev B
│   ├── ExamService.cs                    ← Dev B
│   └── ReportService.cs                  ← Dev B
│
├── Middleware/
│   └── RoleAuthorizationMiddleware.cs    ← Dev A (Check JWT token + Users.Role integer field)
│
└── Helpers/
    ├── PasswordHelper.cs                 ← Dev A (Verify PBKDF2/EF Core custom password hash)
    └── RoleHelper.cs                     ← Dev A
```

---

## 🔴 Dev A — "Core Infra, Admin, Faculty & Department Dashboards"

### 🎯 Scope chi tiết từ Master Plan:
1. **Infrastructure**: Kết nối DB PostgreSQL Supabase pooler (port 6543), scaffold 37 bảng. Custom Auth (không dùng Supabase Auth, dùng bảng `Users` với `PasswordHash` và `PasswordSalt`).
2. **Admin Dashboard (Role 99)**:
   - KPI tổng quát (SV, GV, Khoa, Ngành)
   - Phân bố SV theo Khoa/Ngành (Treemap)
   - Phân bố SV theo Khóa (Grouped Bar)
   - Điểm danh tổng hợp & Tỷ lệ điểm danh (Multi-line & Donut)
   - Phân bố điểm thi (Histogram) và Kết quả thi theo Khoa (Heatmap)
   - Hoạt động hệ thống (AuditLogs)
   - Xem cấu hình (Settings - 11 keys)
   - Thiết bị đăng ký (UserDevices donut)
3. **Trưởng Khoa Dashboard (Role 50)**:
   - KPI Khoa (SV, GV, Ngành, Môn thuộc khoa)
   - Danh sách GV thuộc khoa (Table + Avatar + IsHeadOfFaculty)
   - Điểm danh theo Lớp HP (Stacked Bar)
   - Điểm TB theo Môn trong khoa (Bar Chart)
   - Lịch giảng dạy khoa (Calendar view)
   - Đánh giá giảng viên từ SV (Radar chart)
   - Tiến độ học kỳ (% hoàn thành môn học)
4. **Trưởng Bộ Môn Dashboard (Role 20)**:
   - KPI Bộ môn (SV, Lớp HP, Môn quản lý)
   - Tiến độ giảng dạy (Sessions completed / total)
   - Ngân hàng đề thi bộ môn (QuestionSuites count)
   - So sánh điểm giữa các lớp HP (Grouped bar)
   - Điểm danh chi tiết (Heatmap matrix SV x Buổi)

### 📋 Danh sách Task & Tiến độ:

```
Week 1 — Setup & Auth Framework (Task A1 -> A7):
  ☐ A1. Tạo project Web API .NET 8, tích hợp Npgsql.EntityFrameworkCore.PostgreSQL.
  ☐ A2. Cấu hình DbContext kết nối Supabase, scaffold/reverse engineer 37 Entities.
  ☐ A3. Viết PasswordHelper để kiểm tra hash password hiện có trong cột PasswordHash (Users).
  ☐ A4. Viết AuthService: Tạo token JWT chứa thông tin User.Id, UserName, và Users.Role.
  ☐ A5. Tạo AuthController (POST /api/auth/login, GET /api/auth/me).
  ☐ A6. Viết RoleAuthorizationMiddleware chặn request nếu sai Role ID (1, 2, 10, 20, 50, 99).
  ☐ A7. Merge code lên branch `main` để bàn giao DbContext/Entities cho Dev B.

Week 2 — Admin Dashboard APIs (Task A8 -> A11):
  ☐ A8.  Viết AdminDashboardService truy vấn KPIs, SV theo khoa/khóa, phân bố điểm thi.
  ☐ A9.  Viết AdminDashboardController: GET /api/admin/dashboard.
  ☐ A10. Viết endpoints bổ sung cho Admin: 
         - GET /api/admin/audit-logs (AuditLogs)
         - GET /api/admin/settings (Settings table)
         - GET /api/admin/devices (UserDevices donut data)
  ☐ A11. Viết ScheduleService & ScheduleController: GET /api/schedule/today, /by-week.

Week 3 — Faculty & Dept Dashboards (Task A12 -> A17):
  ☐ A12. Viết FacultyDashboardService truy vấn KPIs khoa, danh sách GV khoa, điểm danh HP.
  ☐ A13. Viết FacultyDashboardController: GET /api/faculty/dashboard.
  ☐ A14. Viết DepartmentDashboardService truy vấn KPIs bộ môn, ngân hàng đề thi.
  ☐ A15. Viết DepartmentDashboardController: GET /api/department/dashboard.
  ☐ A16. Tối ưu hóa SQL query (Index, Eager loading) tránh N+1 query khi hiển thị dashboard.
  ☐ A17. Bàn giao Swagger API Docs cuối cùng.
```

---

## 🔵 Dev B — "Student, Teacher, Attendance, Exam & Reports"

### 🎯 Scope chi tiết từ Master Plan:
1. **Teacher Dashboard (Role 10/2)**:
   - Danh sách lớp đang giảng dạy (`SubjectTeachings` via `SubjectTeachingTeachers`)
   - Lịch dạy hôm nay (`SubjectSchedules` filtered by teacher)
   - Thống kê điểm danh lớp giảng dạy (`Attendances` donut/pie)
   - Kết quả thi của lớp (`ExamResults` box plot)
   - Xem ngân hàng đề thi của môn phụ trách (`QuestionSuites -> Questions` table)
   - Alert list sinh viên vắng nhiều hoặc có warning
2. **Student Dashboard (Role 1)**:
   - Hồ sơ sinh viên (`Users` + `Students` thông tin cá nhân)
   - Lịch học hôm nay (`SubjectSchedules` via `SubjectStudents`)
   - Điểm danh cá nhân (Donut + lịch sử chi tiết)
   - Kết quả điểm thi (`ExamResults` cá nhân qua các kỳ)
   - Môn học đang học & Thông báo (`UserAnnouncements` feed)
3. **Attendance & Exam Analytics (Chung)**:
   - Thống kê điểm danh chi tiết theo lớp, môn, khóa học.
   - Thống kê kết quả thi, phân bố điểm (Grade bands: <4, 4-5, 5-6.5, 6.5-8, 8+).
4. **Reports & CV Integration (Phase 4 & 5)**:
   - Xuất Excel/PDF báo cáo điểm danh, báo cáo điểm thi toàn trường/khoa.
   - Endpoint GET `/api/reports/cv-data/{studentId}`: Gom toàn bộ thông tin học tập, điểm số, chuyên ngành của SV để chuẩn bị dữ liệu cho Frontend render CV (Phase 5).

### 📋 Danh sách Task & Tiến độ:

```
Week 1 — API Contract & Mocking (Task B1 -> B3):
  (Song song lúc Dev A đang làm database)
  ☐ B1. Tạo các DTOs cho Teacher, Student, Attendance, Exam và Reports.
  ☐ B2. Viết Mock Services trả về dữ liệu mẫu khớp với các biểu đồ trong Master Plan.
  ☐ B3. Cùng Dev A thống nhất API Contracts qua Swagger.

Week 2 — Student & Attendance Modules (Task B4 -> B8):
  (Sau khi pull DbContext và Entities từ main về)
  ☐ B4. Viết StudentDashboardService truy vấn profile SV, TKB hôm nay, điểm danh, điểm thi cá nhân.
  ☐ B5. Viết StudentDashboardController: GET /api/student/dashboard.
  ☐ B6. Viết AttendanceService thống kê chi tiết điểm danh (Status: 1=Có mặt, 2=Trễ, 3=Có phép, 4=Không phép).
  ☐ B7. Viết AttendanceController: 
        - GET /api/attendance/stats (theo môn, theo sinh viên)
        - GET /api/attendance/by-class/{subjectTeachingId}
  ☐ B8. Viết API lấy thông báo cá nhân: GET /api/student/announcements.

Week 3 — Teacher, Exams & Report Generation (Task B9 -> B15):
  ☐ B9.  Viết TeacherDashboardService truy vấn lớp đang dạy, lịch dạy hôm nay, ngân hàng đề.
  ☐ B10. Viết TeacherDashboardController: GET /api/teacher/dashboard.
  ☐ B11. Viết ExamService truy vấn phân bố điểm (grade bands), kết quả thi của lớp HP.
  ☐ B12. Viết ExamController: GET /api/exams/distribution, GET /api/exams/results.
  ☐ B13. Tích hợp thư viện xuất báo cáo (ví dụ: QuestPDF, EPPlus) trên .NET 8.
  ☐ B14. Viết ReportController:
         - GET /api/reports/attendance/export (Excel/PDF)
         - GET /api/reports/exams/export (Excel/PDF)
  ☐ B15. Viết endpoint GET /api/reports/cv-data/{studentId} gom thông tin phục vụ Generate CV.
```

---

## 📅 Timeline Tổng Thể & Git Merge Point

```
               Week 1                         Week 2                         Week 3
Dev A 🔴 ┃ A1 ─────────────────── A7 ┃ A8 ────────────────── A11 ┃ A12 ───────────────── A17 ┃
         ┃ .NET Setup, Scaffold DB,  ┃ Admin Dashboard APIs      ┃ Faculty/Dept APIs,        ┃
         ┃ Auth, JWT, Middleware     ┃ Schedule Controllers      ┃ Query Optimization, Polish┃
         ┃                           ┃                           ┃                           ┃
Dev B 🔵 ┃ B1 ────────────── B3 ┃ B4 ──────────────────── B8 ┃ B9 ────────────────── B15 ┃
         ┃ DTO Design, Mock APIs     ┃ Pull core DB -> Student   ┃ Teacher APIs, Exam Stats, ┃
         ┃ Setup Folder Structure    ┃ & Attendance Services     ┃ PDF/Excel Reports, CV Data┃
         ┃                           ┃                           ┃                           ┃
         ┗━━━━━━ MERGE 1 ━━━━━━━━━━━━┛━━━━━━━ MERGE 2 ━━━━━━━━━━━┛━━━━━━━ FINAL MERGE ━━━━━━━┛
         (Dev A push DB lên main,    (Dev B pull main liên tục,  (Tích hợp toàn bộ API,      )
         Dev B kéo về sử dụng)       không lo conflict)          test endpoint bằng Swagger  )
```
