# 📋 MASTER PLAN: Dashboard Quản Lý Trường Cao Đẳng Tây Đô

> **Phân tích ngày**: 2026-07-06  
> **Database**: Supabase PostgreSQL (aws-ap-southeast-1)  
> **Backend gốc**: .NET (Entity Framework Core)  
> **Chế độ**: 🔒 **READ-ONLY** — Chỉ hiển thị & visualize dữ liệu, không thêm/sửa/xoá

---

## 1. 🏗️ Tổng Quan Database

### 1.1 Schema hiện tại: 37 bảng public

```mermaid
erDiagram
    Users ||--o{ Students : "Role=1"
    Users ||--o{ TeacherFaculties : "Role=2,10,20,50"
    Users ||--o{ AuditLogs : logs
    Users ||--o{ UserDevices : devices
    Users ||--o{ UserAnnouncements : notifications
    
    Students ||--o{ Attendances : attends
    Students ||--o{ ExamAttempts : takes
    Students ||--o{ ExamResults : scores
    Students ||--o{ SubjectStudents : enrolls
    Students ||--o{ StudentEvaluations : evaluates
    Students ||--o{ SubjectSpecialNotes : notes
    Students }|--|| AcademicYears : belongs
    Students }|--|| Majors : studies
    
    TeacherFaculties }|--|| Faculties : belongs
    TeacherFaculties ||--o{ SubjectTeachingTeachers : teaches
    TeacherFaculties ||--o{ SubjectSchedules : scheduled
    
    Faculties ||--o{ Majors : has
    Faculties ||--o{ Subjects : owns
    
    Subjects ||--o{ SubjectTeachings : instances
    Subjects ||--o{ QuestionSuites : bank
    
    SubjectTeachings ||--o{ SubjectTeachingExams : exams
    SubjectTeachings ||--o{ SubjectSchedules : schedules
    SubjectTeachings ||--o{ SubjectStudents : students
    
    SubjectTeachingExams ||--o{ ExamAttempts : attempts
    SubjectTeachingExams ||--o{ ExamResults : results
    
    QuestionSuites ||--o{ Questions : contains
    Questions ||--o{ QuestionAnswers : answers
    
    AcademicYears ||--o{ SemesterPlans : semesters
    SemesterPlans ||--o{ SemesterSubjects : curriculum
    Majors ||--o{ SemesterPlans : program
```

### 1.2 Phân bố dữ liệu thực tế

| Bảng | Records | Ghi chú |
|------|---------|---------|
| **Users** | 665 | 576 SV + 67 GV + 13 Admin + 9 Phòng ban |
| **Students** | 577 | Thuộc 15 ngành |
| **Attendances** | 93,865 | Dữ liệu điểm danh chính |
| **ExamResults** | 31,079 | Avg=6.04, Min=0, Max=10.2 |
| **ExamAttempts** | 1,587 | Bài thi trực tuyến |
| **ExamQuestionAnswers** | 176,092 | Chi tiết câu trả lời |
| **SubjectSchedules** | 6,382 | Lịch giảng dạy |
| **SubjectStudents** | 11,365 | Đăng ký môn học |
| **SubjectTeachings** | 557 | Lớp học phần |
| **Subjects** | 390 | Môn học |
| **UserAnnouncements** | 16,809 | Thông báo |
| **StudentEvaluations** | 3,423 | Đánh giá sinh viên |
| **QuestionSuites** | 319 | Bộ đề thi |
| **Questions** | 6,652 | Câu hỏi |

---

## 2. 🔐 Hệ Thống Phân Quyền (Role-Based Access)

### 2.1 Bảng Role hiện tại

| Role ID | Tên | Số lượng | Mô tả suy luận |
|---------|-----|----------|-----------------|
| **1** | Sinh Viên | 576 | Xem thông tin cá nhân, điểm, lịch học |
| **2** | Giáo Viên (cơ bản) | 3 | Giáo viên thỉnh giảng / hạn chế quyền |
| **10** | Giáo Viên | 59 | Giáo viên chính thức, quản lý lớp |
| **20** | Trưởng Bộ Môn | 5 | Quản lý cấp bộ môn / nhóm môn học |
| **50** | Trưởng Khoa | 9 | Quản lý cấp khoa |
| **99** | Admin | 13 | Quản trị hệ thống toàn quyền |

### 2.2 Ma trận phân quyền Dashboard

```
                          Role 1   Role 2   Role 10  Role 20  Role 50  Role 99
                          SV       GV(TG)   GV       TBM      TK       Admin
─────────────────────────────────────────────────────────────────────────────────
Dashboard Overview         ✅(*)    ✅(*)    ✅(*)    ✅       ✅       ✅
Xem thống kê điểm danh   ❌       ❌       ✅(lớp)  ✅(BM)   ✅(khoa) ✅(all)
Xem kết quả thi/điểm     ✅(cá)   ❌       ✅(lớp)  ✅(BM)   ✅(khoa) ✅(all)
Xem danh sách sinh viên   ❌       ❌       ✅(lớp)  ✅(BM)   ✅(khoa) ✅(all)
Xem danh sách giáo viên   ❌       ❌       ❌       ✅(BM)   ✅(khoa) ✅(all)
Xem ngân hàng câu hỏi    ❌       ❌       ✅(môn)  ✅(BM)   ✅(khoa) ✅(all)
Xem thời khóa biểu       ✅(cá)   ✅(cá)   ✅(cá)   ✅(BM)   ✅(khoa) ✅(all)
Xem thông tin khoa/ngành  ❌       ❌       ❌       ❌       ✅(khoa) ✅(all)
Báo cáo & Analytics       ❌       ❌       ❌       ✅       ✅       ✅
Generate CV (future)       ✅       ❌       ❌       ❌       ❌       ✅(all)
─────────────────────────────────────────────────────────────────────────────────
(*) = scope giới hạn theo context cá nhân
🔒 Tất cả đều READ-ONLY — không có chức năng thêm/sửa/xoá
```

---

## 3. 📊 Dashboard Modules & Visualizations

### 3.1 Module A: Admin Dashboard (Role 99)

> [!IMPORTANT]
> Dashboard toàn diện nhất, có thể xem mọi thứ. Là nơi ra quyết định chiến lược.

| Widget | Loại Chart | Dữ liệu | Bảng nguồn |
|--------|------------|----------|-------------|
| Tổng quan nhanh | KPI Cards | Tổng SV, GV, Khoa, Ngành | Users, Students, Faculties, Majors |
| SV theo Khoa/Ngành | Treemap / Stacked Bar | Phân bố SV theo khoa → ngành | Students → Majors → Faculties |
| SV theo Khóa | Grouped Bar | SV per AcademicYear | Students → AcademicYears |
| Điểm danh tổng hợp | Multi-line Chart | Trend điểm danh theo tháng | Attendances |
| Tỉ lệ điểm danh | Donut/Pie | Có mặt/Vắng CP/Vắng KP/Trễ | Attendances.Status (1=✅, 2=Trễ, 3=VắngCP, 4=VắngKP) |
| Phân bố điểm thi | Histogram + Bell Curve | Điểm TB, phân bố | ExamResults.Result |
| Kết quả thi theo Khoa | Heatmap | Avg score per subject per faculty | ExamResults → SubjectTeachingExams → Subjects → Faculties |
| Hoạt động hệ thống | Timeline / Activity Log | Recent actions | AuditLogs |
| Xem cài đặt | Read-only Table | 11 settings | Settings |
| Thiết bị đăng ký | Donut | Device distribution by role | UserDevices |

### 3.2 Module B: Trưởng Khoa Dashboard (Role 50)

| Widget | Loại Chart | Dữ liệu |
|--------|------------|----------|
| KPI Khoa | Cards | Tổng SV, GV, Ngành, Môn trong khoa |
| GV của Khoa | Table + Avatar | Danh sách GV, IsHeadOfFaculty |
| Điểm danh theo Lớp HP | Stacked Bar | % từng status per SubjectTeaching |
| Điểm TB theo Môn | Bar Chart sorted | Avg ExamResult per Subject |
| Lịch giảng dạy Khoa | Calendar/Gantt | SubjectSchedules filtered by faculty |
| Đánh giá GV (từ SV) | Radar Chart | StudentEvaluations per Teacher |
| Tiến độ Học kỳ | Progress Bar | % subjects completed vs planned |

### 3.3 Module C: Trưởng Bộ Môn Dashboard (Role 20)

| Widget | Loại Chart | Dữ liệu |
|--------|------------|----------|
| KPI Bộ môn | Cards | Tổng SV, Lớp HP, Môn quản lý |
| Tiến độ giảng dạy | Progress Bars | Sessions completed / total |
| Ngân hàng đề thi | Table | QuestionSuites per Subject (count questions) |
| So sánh điểm lớp | Grouped Bar | Avg score per SubjectTeaching |
| Điểm danh chi tiết | Heatmap | Student × Session matrix |

### 3.4 Module D: Giáo Viên Dashboard (Role 10)

| Widget | Loại Chart | Dữ liệu |
|--------|------------|----------|
| Lớp đang dạy | Cards/List | SubjectTeachings assigned (via SubjectTeachingTeachers) |
| Lịch dạy hôm nay | Timeline | SubjectSchedules today |
| Thống kê điểm danh lớp | Donut per class | Attendances per SubjectTeaching |
| Kết quả thi lớp | Box Plot | Score distribution per exam |
| Xem đề thi | Read-only Table | QuestionSuites → Questions |
| SV cần chú ý | Alert List | Students with warnings / high absence |

### 3.5 Module E: Sinh Viên Dashboard (Role 1)

| Widget | Loại Chart | Dữ liệu |
|--------|------------|----------|
| Thông tin cá nhân | Profile Card | Users + Students joined |
| Lịch học hôm nay | Timeline | SubjectSchedules via SubjectStudents |
| Điểm danh của tôi | Donut + History | Attendances personal |
| Kết quả thi | Table + Trend line | ExamResults personal |
| Môn học đang học | Cards/List | SubjectStudents → SubjectTeachings |
| Thông báo | Feed | UserAnnouncements |
| **Generate CV** (future) | Form + Preview | Tổng hợp thông tin cá nhân → CV |

---

## 4. 🚀 Roadmap Phát Triển (5 Phases)

### Phase 1: Foundation (1-2 tuần)
```
📦 Khởi tạo dự án
├── Setup Next.js + TypeScript + Tailwind
├── Supabase client config (connection pooler)
├── Authentication flow (sử dụng bảng Users hiện tại)
├── Role-based routing middleware
├── Base layout: Sidebar + Header + Content area
├── Design system: tokens, components cơ bản
└── Database types generation (from schema)
```

### Phase 2: Core Dashboards (2-3 tuần)
```
📊 Dashboard theo Role (READ-ONLY)
├── Admin Overview Dashboard (KPI cards, charts)
├── Teacher Dashboard (classes, schedules, stats)
├── Student Dashboard (grades, schedule)
├── Shared components: DataTable, Charts, Filters
└── Server Actions cho read-only data aggregation
```

### Phase 3: Chi tiết & Drill-down (2-3 tuần)
```
🔍 Xem chi tiết dữ liệu
├── Xem thống kê điểm danh (charts + tables)
├── Xem kết quả thi (analytics + distribution)
├── Xem thời khóa biểu (calendar view)
├── Xem danh sách SV/GV (read-only tables + filters)
├── Xem thông báo hệ thống
└── Role 50/20 specific views
```

### Phase 4: Analytics & Reports (2-3 tuần)
```
📈 Báo cáo nâng cao
├── Điểm danh trend analysis
├── Kết quả học tập theo khoa/ngành
├── Đánh giá giảng viên dashboard
├── Export reports (PDF/Excel)
└── Comparative analytics (semester over semester)
```

### Phase 5: Generate CV (2-3 tuần)
```
📄 Tính năng Generate CV
├── Template CV builder
├── Auto-fill từ DB (Students, ExamResults, Subjects, etc.)
├── PDF generation
├── Multiple template styles
└── SV tự tạo + Admin bulk generate
```

---

## 5. 🏛️ Kiến Trúc Đề Xuất

> **UI có sẵn** — chỉ cần Backend API + Frontend kết nối dữ liệu

```mermaid
graph TB
    subgraph "Frontend - React + Vite"
        A["React Router + Auth Guard"]
        B["/admin/*  - Role 99"]
        C["/faculty/* - Role 50"]  
        D["/dept/*    - Role 20"]
        E["/teacher/* - Role 10,2"]
        F["/student/* - Role 1"]
        G["/cv/*      - Generate CV"]
    end
    
    subgraph "Backend - .NET 8 Web API"
        H["Controllers (GET only)"]
        I["Services (Business Logic)"]
        J["EF Core (DbContext + Entities)"]
        K["JWT Auth + Role Middleware"]
    end
    
    subgraph "Database"
        L["Supabase PostgreSQL (existing schema)"]
    end
    
    A --> B & C & D & E & F & G
    B & C & D & E & F & G -->|REST API| H
    H --> K
    H --> I --> J --> L
```

---

## 6. 📐 Data Queries Quan Trọng (Pre-designed)

### Query: Dashboard Overview
```sql
-- KPI Cards
SELECT 
  (SELECT count(*) FROM "Students" WHERE "IsDeleted" = false) as total_students,
  (SELECT count(*) FROM "TeacherFaculties" WHERE "IsDeleted" = false) as total_teachers,
  (SELECT count(*) FROM "Faculties" WHERE "IsDeleted" = false) as total_faculties,
  (SELECT count(*) FROM "Subjects" WHERE "IsDeleted" = false AND "IsActived" = true) as active_subjects;
```

### Query: Attendance by Status
```sql
-- Status: 1=Có mặt, 2=Đi trễ, 3=Vắng có phép, 4=Vắng không phép
SELECT "Status", count(*) as total
FROM "Attendances"
GROUP BY "Status"
ORDER BY "Status";
```

### Query: Exam Score Distribution
```sql
SELECT 
  CASE 
    WHEN "Result" < 4 THEN 'Kém (<4)'
    WHEN "Result" < 5 THEN 'Yếu (4-5)'
    WHEN "Result" < 6.5 THEN 'TB (5-6.5)'
    WHEN "Result" < 8 THEN 'Khá (6.5-8)'
    ELSE 'Giỏi (8+)'
  END as grade_band,
  count(*) as students
FROM "ExamResults"
WHERE "Result" IS NOT NULL AND "IsDeleted" = false
GROUP BY grade_band;
```

### Query: Điểm danh trend theo tháng
```sql
SELECT 
  date_trunc('month', "CreationDate") as month,
  "Status",
  count(*) as total
FROM "Attendances"
GROUP BY month, "Status"
ORDER BY month;
```

---

## 7. ⚠️ Lưu Ý Quan Trọng

> [!WARNING]
> ### Vấn đề bảo mật cần xử lý
> 1. **Không có RLS Policies** — Hiện tại database **không có Row Level Security** nào. Cần thêm RLS cho mọi bảng.
> 2. **Password hash trong DB riêng** — Users table có PasswordHash/Salt riêng (không dùng Supabase Auth). Cần quyết định: migrate sang Supabase Auth hay giữ custom auth.
> 3. **Integer-based roles** — Role là integer, cần map cẩn thận trong middleware.

> [!NOTE]
> ### Dữ liệu đặc biệt
> - Bảng `Students` có nhiều trường cá nhân nhạy cảm (FatherName, MotherName, CCCD, etc.) — quan trọng cho CV generation.
> - `SubjectTeachingExams` có phân loại câu hỏi theo độ khó (NumOfEasy, NumOfNormal, NumOfHard) — hữu ích cho analytics.
> - `StudentEvaluations` có 2 chiều: SV đánh giá GV + GV đánh giá SV (trường Type).
> - Attendance status mapping: **1**=Có mặt(59,807) | **2**=Trễ(3,381) | **3**=Vắng CP(3,171) | **4**=Vắng KP(27,506).

---

## 8. 🎯 Prompt Gửi Agent

Dưới đây là prompt tối ưu để gửi cho coding agent khi bắt đầu phát triển:

---

### Prompt cho Dev A (Backend .NET 8):

````
Bạn đang phát triển Backend .NET 8 Web API (READ-ONLY) cho Dashboard quản lý trường Cao Đẳng Tây Đô.

## Database
- Supabase PostgreSQL: postgresql://postgres.ieqiqaxhseswuzmphmxn:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
- 37 bảng public (PascalCase — EF Core convention), dữ liệu thật
- 665 users, 577 SV, 93K attendance, 31K exam results

## Role System (Users.Role integer)
- 1: Sinh Viên (576) | 2: GV thỉnh giảng (3) | 10: Giáo Viên (59)
- 20: Trưởng BM (5) | 50: Trưởng Khoa (9) | 99: Admin (13)

## Tech Stack
- .NET 8 Web API
- EF Core + Npgsql (PostgreSQL)
- JWT Authentication
- Swagger/OpenAPI

## QUAN TRỌNG
- READ-ONLY: Chỉ GET endpoints, KHÔNG POST/PUT/DELETE (trừ login)
- UI đã có sẵn, chỉ cần API trả JSON
- Soft delete: luôn filter WHERE IsDeleted = false
- UUID primary keys
- TeacherFaculties: junction Teacher ↔ Faculty (IsHeadOfFaculty)
- SubjectTeachingTeachers: junction SubjectTeaching ↔ Teacher (IsMainTeacher)
- Attendance Status: 1=Có mặt, 2=Trễ, 3=Vắng CP, 4=Vắng KP

## Yêu cầu
1. Tạo project .NET 8 Web API
2. Tạo AppDbContext + tất cả Entity classes (37 bảng)
3. Tạo AuthController (POST /api/auth/login → JWT, GET /api/auth/me)
4. Tạo DTOs cho dashboard data (KPIs, charts, tables)
5. Tạo Services + Controllers cho:
   - GET /api/admin/dashboard (KPIs, SV theo khoa, điểm danh trend, phân bố điểm)
   - GET /api/teacher/dashboard (lớp đang dạy, lịch, điểm danh, kết quả thi)
   - GET /api/student/dashboard (profile, lịch, điểm danh, điểm thi)
   - GET /api/faculty/dashboard, GET /api/department/dashboard
   - GET /api/attendance/stats, /trend, /by-student/{id}
   - GET /api/exams/distribution, /results, /by-student/{id}
   - GET /api/schedule/today, /by-teacher/{id}, /by-student/{id}
6. Role-based authorization middleware (filter data theo scope role)
7. Export Swagger JSON
````

### Prompt cho Dev B (Frontend React):

````
Bạn đang phát triển Frontend React cho Dashboard quản lý trường Cao Đẳng Tây Đô.

## Context
- Backend: .NET 8 Web API (đã có/đang phát triển song song)
- UI components: ĐÃ CÓ SẴN, chỉ cần import và truyền data
- Chế độ: READ-ONLY (chỉ hiển thị dữ liệu, không thêm/sửa/xoá)

## Tech Stack
- React + Vite + TypeScript
- React Router v6 (role-based routing)
- Axios (API client + JWT interceptor)

## Role System (integer)
- 1: Sinh Viên | 2: GV thỉnh giảng | 10: Giáo Viên
- 20: Trưởng BM | 50: Trưởng Khoa | 99: Admin

## Yêu cầu
1. Setup React + Vite + TypeScript
2. Tạo API client layer (axios instance, JWT interceptor)
3. Tạo TypeScript types mirror backend DTOs
4. Tạo AuthContext + useAuth hook + Login page
5. Tạo ProtectedRoute + role-based routing:
   - Role 99 → /admin/*, Role 50 → /faculty/*, Role 20 → /department/*
   - Role 10,2 → /teacher/*, Role 1 → /student/*
6. Tạo pages cho từng role:
   - Mỗi page gọi API → nhận JSON → truyền vào UI components có sẵn
   - Admin: KPI cards, chart SV theo khoa, điểm danh trend, phân bố điểm
   - Teacher: lớp đang dạy, lịch hôm nay, thống kê điểm danh
   - Student: profile, lịch học, điểm danh, kết quả thi
7. Error handling, loading states
````

---

> [!TIP]
> **Cách sử dụng prompt trên**: Copy prompt trong block code ở Section 8, thay `[PHASE CỤ THỂ]` bằng phase bạn muốn bắt đầu, và thay `[PASSWORD]` bằng mật khẩu database. Gửi cho agent để bắt đầu code.
