# MÔ TẢ CHỨC NĂNG THEO TỪNG ROLE

**Dự án:** Hệ thống Cổng Thông Tin & Tạo CV Tự Động — Trường Cao Đẳng Tây Đô

---

## CHỨC NĂNG CHUNG — XÁC THỰC (Authentication)

### 1. Đăng nhập (`POST /api/auth/login`)

**Mô tả:** Xác thực người dùng bằng tên đăng nhập và mật khẩu, trả về JWT Token.

**Bảng truy vấn:**

| Bảng | Khóa / Điều kiện | Mô tả |
|------|-------------------|-------|
| `Users` | `UserName == request.Username` | Tìm user theo tên đăng nhập |

**Luồng xử lý:**
- Query `Users` tìm theo `UserName`
- So sánh mật khẩu đã mã hóa (BCrypt)
- Nếu khớp → tạo JWT Token chứa `UserId`, `Role`, `FullName`

---

### 2. Lấy thông tin người dùng hiện tại (`GET /api/auth/me`)

**Mô tả:** Giải mã JWT Token để lấy thông tin chi tiết người dùng đang đăng nhập.

**Bảng truy vấn:**

| Bảng | Khóa / Điều kiện | Mô tả |
|------|-------------------|-------|
| `Users` | `Id == userId` (từ JWT claim) | Tìm user theo ID trong token |

---

## ROLE 1 — SINH VIÊN (Student)

### Chức năng 1: Dashboard Sinh viên (`GET /api/student/dashboard`)

**Mô tả:** Lấy tổng quan dashboard bao gồm hồ sơ cá nhân, lịch học hôm nay, thống kê chuyên cần, danh sách môn học hiện tại và thông báo. API này gộp nhiều nguồn dữ liệu thành 1 response duy nhất.

**Bảng truy vấn & các phép JOIN:**

#### a) Lấy hồ sơ cá nhân (`GetStudentProfileInternalAsync`)

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `Students` | `Students.Id == studentId` HOẶC `Students.UserId == studentId` | `!IsDeleted` | Tìm sinh viên |
| → `Users` | `Students.UserId → Users.Id` | (Include) | Lấy họ tên, ngày sinh, MSSV, SĐT, CCCD |
| → `Majors` | `Students.MajorId → Majors.Id` | (Include) | Lấy tên ngành học |
| → `AcademicYears` | `Students.AcademicYearId → AcademicYears.Id` | (Include) | Lấy tên khóa học |
| `ExamResults` | `ExamResults.StudentId == actualStudentId` | `!IsDeleted` | Tính điểm GPA tích lũy (trung bình cộng tất cả `Result`) |

#### b) Lấy lịch học hôm nay (`GetTodaySchedulesInternalAsync`)

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `SubjectStudents` | `SubjectStudents.StudentId == studentId` | — | Lấy danh sách `SubjectTeachingId` mà sinh viên đang theo học |
| `SubjectSchedules` | `SubjectSchedules.SubjectTeachingId` ∈ danh sách trên | `!IsDeleted`, `StartDateTime.Date == today` | Lấy lịch học trong ngày |
| → `SubjectTeachings` | `SubjectSchedules.SubjectTeachingId → SubjectTeachings.Id` | (Include) | Lấy tên lớp học phần |
| → → `Subjects` | `SubjectTeachings.SubjectId → Subjects.Id` | (ThenInclude) | Lấy tên môn học |
| → `Rooms` | `SubjectSchedules.RoomId → Rooms.Id` | (Include) | Lấy phòng học |
| → `Teachers` → `Users` | `SubjectSchedules.TeacherId → Teachers.Id → Users.Id` | (Include → ThenInclude) | Lấy tên giảng viên |

#### c) Thống kê chuyên cần (`GetAttendanceStatsInternalAsync`)

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `Attendances` | `Attendances.StudentId == studentId` | — | Lấy tất cả bản ghi điểm danh |

**Xử lý:** Nhóm theo `Status` (1=Có mặt, 2=Trễ, 3=Vắng có phép, 4=Vắng không phép), đếm số lượng mỗi loại.

#### d) Danh sách môn học hiện tại (`GetCurrentSubjectsInternalAsync`)

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `SubjectStudents` | `SubjectStudents.StudentId == studentId` | `SubjectTeaching != null`, `!SubjectTeaching.IsDeleted` | Lấy lớp học phần SV đang học |
| → `SubjectTeachings` | `SubjectStudents.SubjectTeachingId → SubjectTeachings.Id` | (Include) | Lấy thông tin lớp học phần |
| → → `Subjects` | `SubjectTeachings.SubjectId → Subjects.Id` | (ThenInclude) | Lấy tên môn, mã môn, số tín chỉ |
| `SubjectTeachingTeachers` | `SubjectTeachingTeachers.SubjectTeachingId == ssId` | `!IsDeleted` | Lấy giảng viên phụ trách |
| → `Teachers` → `Users` | Navigation property | — | Lấy tên giảng viên |
| `SubjectSchedules` | `SubjectSchedules.SubjectTeachingId == ssId` | `EndDateTime <= UtcNow`, `!IsDeleted` | Đếm số buổi đã hoàn thành |

#### e) Thông báo (`GetAnnouncementsInternalAsync`)

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `UserAnnouncements` | `UserIds.Contains(userId)` HOẶC `UserIds.Contains(studentId)` | `!IsDeleted` | Lấy thông báo dành cho SV |

**Sắp xếp:** Theo `CreationDate` giảm dần (mới nhất lên đầu).

---

### Chức năng 2: Bảng điểm theo học kỳ (`GET /api/student/scores`)

**Mô tả:** Lấy bảng điểm đầy đủ, phân nhóm theo từng học kỳ, bao gồm điểm thành phần (thường xuyên, giữa kỳ, cuối kỳ) và điểm tổng kết.

**Bảng truy vấn & các phép JOIN:**

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `Students` | `Id == studentId` HOẶC `UserId == studentId` | `!IsDeleted` | Xác định sinh viên |
| → `Majors` | `Students.MajorId → Majors.Id` | (Include) | Lấy `FacultyId` để lọc môn theo khoa |
| `SemesterPlans` | `SemesterPlans.MajorId == student.MajorId` | `!IsDeleted` | Lấy danh sách học kỳ |
| → `AcademicYears` | `SemesterPlans.AcademicYearId → AcademicYears.Id` | (Include) | Lấy tên năm học |
| `ExamResults` | `ExamResults.StudentId == student.Id` | `!IsDeleted`, các navigation property không null và `!IsDeleted` | Lấy toàn bộ kết quả thi |
| → `SubjectTeachingExams` | `ExamResults.SubjectTeachingExamId → SubjectTeachingExams.Id` | (Include) | Lấy thông tin kỳ thi (tên, loại, ngày) |
| → → `SubjectTeachings` | `SubjectTeachingExams.SubjectTeachingId → SubjectTeachings.Id` | (ThenInclude) | Lấy lớp học phần (StartDate, EndDate) |
| → → → `Subjects` | `SubjectTeachings.SubjectId → Subjects.Id` | (ThenInclude) | Lấy tên môn, mã môn, số tín chỉ, FacultyId |

**Xử lý logic phức tạp:**
- Lọc `ExamResults` theo khoảng thời gian `StartDate`/`EndDate` của `SubjectTeaching` để phân vào từng `SemesterPlan`
- Lọc thêm theo `FacultyId` nếu có
- Nhóm theo `SubjectCode` → Phân loại điểm thành phần dựa trên `Type` (1=Thường xuyên 10%, 2=Giữa kỳ 40%, 3=Cuối kỳ 50%)
- Tính `CombinedResult` = tổng(điểm × trọng số) / tổng trọng số
- Xếp loại A/B/C/D/F → Quy đổi hệ 4 điểm
- Tính GPA trung bình có trọng số theo tín chỉ cho mỗi học kỳ

---

### Chức năng 3: Thông báo (`GET /api/student/announcements`)

**Mô tả:** Lấy danh sách thông báo dành cho sinh viên.

**Bảng truy vấn:**

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `Students` | `Id == studentId` HOẶC `UserId == studentId` | `!IsDeleted` | Xác định sinh viên |
| `UserAnnouncements` | `UserIds.Contains(userId)` HOẶC `UserIds.Contains(studentId)` | `!IsDeleted` | Lấy thông báo |

*(Tái sử dụng cùng hàm `GetAnnouncementsInternalAsync` như Dashboard)*

---

### Chức năng 4: Thời khóa biểu (`GET /api/schedule/student/{id}`)

**Mô tả:** Lấy thời khóa biểu sinh viên theo học kỳ, hiển thị dạng lưới tuần.

**Bảng truy vấn & các phép JOIN:**

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `Users` | `Users.UserName == id` HOẶC `Users.UserInternalId == id` | — | Resolve studentId nếu truyền vào không phải Guid |
| `Students` | `Students.UserId == userId` HOẶC `Students.Id == guid` | `!IsDeleted` | Xác định sinh viên |
| `SubjectStudents` | `SubjectStudents.StudentId == student.Id` | — | Lấy danh sách `SubjectTeachingId` |
| `SubjectSchedules` | `SubjectSchedules.SubjectTeachingId` ∈ danh sách trên | `!IsDeleted` | Lấy tất cả buổi học |
| → `SubjectTeachings` | `SubjectSchedules.SubjectTeachingId → SubjectTeachings.Id` | (Include) | Lấy tên lớp học phần |
| → → `Subjects` | `SubjectTeachings.SubjectId → Subjects.Id` | (ThenInclude) | Lấy tên môn, mã môn |
| → `Rooms` | `SubjectSchedules.RoomId → Rooms.Id` | (Include) | Lấy phòng học |
| → `Teachers` → `Users` | Navigation property | (Include → ThenInclude) | Lấy tên giảng viên |
| `SemesterPlans` | `SemesterPlans.MajorId == student.MajorId` | Lọc theo `semesterId` nếu có | Xác định khoảng thời gian học kỳ để lọc lịch |

---

### Chức năng 5: Lấy danh sách học kỳ (`GET /api/schedule/semesters`)

**Mô tả:** Lấy danh sách tất cả học kỳ để hiển thị dropdown chọn lọc.

**Bảng truy vấn:**

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `SemesterPlans` | — | `!IsDeleted` | Lấy tất cả học kỳ |
| → `AcademicYears` | `SemesterPlans.AcademicYearId → AcademicYears.Id` | (Include) | Lấy tên năm học |
| → `Majors` | `SemesterPlans.MajorId → Majors.Id` | (Include) | Lấy tên ngành |

---

## ROLE 10 — GIẢNG VIÊN (Teacher)

### Chức năng 1: Dashboard Giảng viên (`GET /api/teacher/dashboard`)

**Mô tả:** Lấy tổng quan dashboard bao gồm KPI (số lớp, số tiết hôm nay, số SV cảnh báo), danh sách lớp, lịch dạy hôm nay, thống kê chuyên cần, danh sách SV cần cảnh báo.

**Bảng truy vấn & các phép JOIN:**

#### a) Xác định giảng viên

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `Teachers` | `Teachers.Id == teacherId` HOẶC `Teachers.UserId == teacherId` | `!IsDeleted` | Tìm giảng viên |
| `Users` | `Users.Id == teacherId` | Fallback nếu không tìm được trong bảng Teachers | Tìm qua bảng Users |

#### b) Danh sách lớp đang dạy

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `SubjectTeachingTeachers` | `SubjectTeachingTeachers.TeacherId == teacher.Id` | `!IsDeleted` | Lấy lớp phụ trách |
| → `SubjectTeachings` | `STT.SubjectTeachingId → SubjectTeachings.Id` | (Include) | Lấy thông tin lớp học phần |
| → → `Subjects` | `SubjectTeachings.SubjectId → Subjects.Id` | (ThenInclude) | Lấy tên môn, mã môn |
| `SubjectStudents` | `SubjectStudents.SubjectTeachingId == stId` | — | Đếm sĩ số (Count) |
| `SubjectSchedules` | `SubjectSchedules.SubjectTeachingId == stId` | `EndDateTime <= UtcNow`, `!IsDeleted` | Đếm số buổi đã hoàn thành |

#### c) Lịch dạy hôm nay

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `SubjectSchedules` | `SubjectSchedules.TeacherId == teacher.Id` | `!IsDeleted`, `StartDateTime.Date == today` | Lấy lịch dạy hôm nay |
| → `SubjectTeachings` → `Subjects` | Navigation property | (Include → ThenInclude) | Lấy tên môn |
| → `Rooms` | Navigation property | (Include) | Lấy phòng dạy |

#### d) Thống kê chuyên cần tổng hợp

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `Attendances` | `Attendances.SubjectSchedule.TeacherId == teacher.Id` | — | Lấy tất cả bản ghi điểm danh các lớp GV dạy |
| → `SubjectSchedules` | `Attendances.SubjectScheduleId → SubjectSchedules.Id` | Navigation property | Liên kết để lọc theo giảng viên |

**Xử lý:** Nhóm theo `Status`, đếm từng loại (Có mặt/Trễ/Vắng CP/Vắng KP).

#### e) Danh sách sinh viên cảnh báo

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `SubjectStudents` | Duyệt qua từng lớp của GV | — | Lấy danh sách SV trong lớp |
| → `Students` → `Users` | Navigation property | — | Lấy tên SV |
| `Attendances` | `Attendances.StudentId == studentId` | `SubjectSchedule.SubjectTeachingId == stId` | Đếm số buổi vắng (Status 3 hoặc 4) |

**Xử lý:** Nếu số buổi vắng ≥ 3 → đưa vào danh sách cảnh báo. Nhãn trạng thái: "Warning" (≥5 buổi) hoặc "Notice" (3-4 buổi).

---

### Chức năng 2: Lịch dạy theo học kỳ (`GET /api/schedule/teacher/{id}`)

**Bảng truy vấn & các phép JOIN:**

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `Users` | `UserName == id` HOẶC `UserInternalId == id` | — | Resolve teacherId |
| `Teachers` | `Teachers.UserId == userId` | `!IsDeleted` | Xác định giảng viên |
| `SubjectSchedules` | `SubjectSchedules.TeacherId == teacher.Id` | `!IsDeleted` | Lấy tất cả buổi dạy |
| → `SubjectTeachings` → `Subjects` | Navigation property | (Include → ThenInclude) | Lấy tên môn, mã môn |
| → `Rooms` | Navigation property | (Include) | Lấy phòng dạy |
| `SemesterPlans` | — | Lọc theo `semesterId` nếu có | Lọc lịch theo khoảng thời gian học kỳ |

---

### Chức năng 3: Ngân hàng đề thi (`GET /api/teacher/question-suites`)

**Bảng truy vấn & các phép JOIN:**

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `Teachers` | `Teachers.Id == teacherId` HOẶC `Teachers.UserId == teacherId` | `!IsDeleted` | Xác định giảng viên |
| `SubjectTeachingTeachers` | `STT.TeacherId == teacher.Id` | `!IsDeleted` | Lấy danh sách môn GV phụ trách |
| → `SubjectTeachings` → `Subjects` | Navigation property | Include → ThenInclude | Lấy tên môn, mã môn |
| `QuestionSuites` | `QuestionSuites.SubjectId == subjectId` | `!IsDeleted` | Lấy bộ đề thi theo môn |
| `Questions` | `Questions.QuestionSuiteId == suiteId` | `!IsDeleted` | Đếm câu hỏi theo độ khó |

**Xử lý:** Nhóm câu hỏi theo `DifficultyLevel` (1=Dễ, 2=Vừa, 3=Khó), đếm số lượng từng loại.

---

## ROLE 20 — TRƯỞNG BỘ MÔN (Department Head)

### Chức năng 1: Dashboard Trưởng Bộ Môn (`GET /api/department/dashboard`)

**Mô tả:** Thống kê KPI bộ môn, tiến độ giảng dạy, so sánh điểm giữa các lớp.

**Bảng truy vấn & các phép JOIN:**

#### a) KPI bộ môn

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `Departments` | `Departments.Id == departmentId` | `!IsDeleted` | Xác định bộ môn |
| `Subjects` | `Subjects.FacultyId == department.FacultyId` | `!IsDeleted` | Đếm tổng môn học |
| `SubjectTeachings` | `SubjectTeachings.SubjectId` ∈ danh sách Subjects | `!IsDeleted` | Đếm tổng lớp học phần |
| `SubjectStudents` | `SubjectStudents.SubjectTeachingId` ∈ danh sách trên | — | Đếm tổng sinh viên (distinct) |

#### b) Tiến độ giảng dạy

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `SubjectTeachings` | Từ danh sách môn | `!IsDeleted` | Lấy tổng số buổi (`TotalSessions`) |
| → `Subjects` | Navigation property | — | Lấy tên môn |
| `SubjectSchedules` | `SubjectSchedules.SubjectTeachingId == stId` | `EndDateTime <= UtcNow`, `!IsDeleted` | Đếm số buổi đã hoàn thành |

#### c) So sánh điểm giữa các lớp

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `ExamResults` | Lọc theo danh sách `SubjectTeachingId` | `!IsDeleted`, `Result != null` | Lấy kết quả thi |
| → `SubjectTeachingExams` → `SubjectTeachings` | Navigation property | Include → ThenInclude | Xác định lớp học phần |
| → → `Subjects` | Navigation property | ThenInclude | Lấy tên môn |

**Xử lý:** Nhóm theo tên lớp, tính điểm trung bình mỗi lớp.

---

### Chức năng 2: Ngân hàng câu hỏi bộ môn (`GET /api/department/questions`)

**Bảng truy vấn:**

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `Departments` | `Id == departmentId` | `!IsDeleted` | Xác định bộ môn |
| `Subjects` | `Subjects.FacultyId == department.FacultyId` | `!IsDeleted` | Lấy danh sách môn thuộc bộ môn |
| `QuestionSuites` | `QuestionSuites.SubjectId == subjectId` | `!IsDeleted` | Lấy bộ đề theo môn |
| `Questions` | `Questions.QuestionSuiteId == suiteId` | `!IsDeleted` | Đếm câu hỏi theo `DifficultyLevel` |

---

### Chức năng 3: Heatmap điểm danh (`GET /api/attendance/heatmap/{classId}`)

**Bảng truy vấn:**

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `SubjectTeachings` | `Id == classId` | `!IsDeleted` | Xác định lớp học phần |
| `SubjectStudents` | `SubjectStudents.SubjectTeachingId == classId` | — | Lấy danh sách SV trong lớp |
| → `Students` → `Users` | Navigation property | — | Lấy tên SV |
| `SubjectSchedules` | `SubjectSchedules.SubjectTeachingId == classId` | `!IsDeleted`, sắp xếp theo `StartDateTime` | Lấy danh sách buổi học (cột heatmap) |
| `Attendances` | `Attendances.StudentId` ∈ danh sách SV, `Attendances.SubjectScheduleId` ∈ danh sách buổi | — | Lấy trạng thái điểm danh |

**Xử lý:** Tạo ma trận sinh viên × buổi học, mỗi ô chứa ký hiệu: V=Có mặt, T=Trễ, P=Vắng CP, K=Vắng KP.

---

## ROLE 50 — TRƯỞNG KHOA (Faculty Dean)

### Chức năng 1: Dashboard Trưởng Khoa (`GET /api/faculty/dashboard`)

**Mô tả:** Thống kê toàn khoa bao gồm KPI, biểu đồ chuyên cần, đánh giá giảng viên, điểm trung bình theo môn, danh sách giảng viên.

**Bảng truy vấn & các phép JOIN:**

#### a) KPI khoa

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `Faculties` | `Faculties.Id == facultyId` | `!IsDeleted` | Xác định khoa |
| `Majors` | `Majors.FacultyId == facultyId` | `!IsDeleted` | Đếm số ngành |
| `Students` | `Students.MajorId` ∈ danh sách Majors | `!IsDeleted` | Đếm tổng sinh viên |
| `Teachers` | `Teachers.FacultyId == facultyId` | `!IsDeleted` | Đếm tổng giảng viên |
| `Subjects` | `Subjects.FacultyId == facultyId` | `!IsDeleted` | Đếm tổng môn học |

#### b) Tiến độ học kỳ

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `SemesterPlans` | `SemesterPlans.MajorId` ∈ danh sách Majors | `!IsDeleted`, chứa ngày hiện tại | Tìm học kỳ hiện tại |

**Xử lý:** Tính `progress = (today - startDate) / (endDate - startDate) × 100`.

#### c) Thống kê chuyên cần theo lớp (Stacked Bar Chart)

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `SubjectTeachings` | `SubjectTeachings.SubjectId` ∈ Subjects của khoa | `!IsDeleted` | Lấy danh sách lớp học phần |
| → `Subjects` | Navigation property | — | Lấy tên môn |
| `SubjectSchedules` | `SubjectSchedules.SubjectTeachingId == stId` | `!IsDeleted` | Lấy danh sách buổi học |
| `Attendances` | `Attendances.SubjectScheduleId` ∈ danh sách buổi | — | Lấy dữ liệu điểm danh |

**Xử lý:** Nhóm theo tên lớp, tính phần trăm mỗi trạng thái (Có mặt/Trễ/Vắng CP/Vắng KP).

#### d) Đánh giá giảng viên (Radar Chart)

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `TeacherEvaluations` | `TeacherEvaluations.TeacherId` ∈ danh sách GV khoa | `!IsDeleted` | Lấy kết quả đánh giá |

**Xử lý:** Tính điểm trung bình cho các tiêu chí đánh giá: Nội dung, Phương pháp, Thái độ, Hỗ trợ, Tổng thể.

#### e) Điểm trung bình theo môn (Horizontal Bar)

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `ExamResults` | Lọc theo `SubjectTeaching` thuộc khoa | `!IsDeleted`, `Result != null` | Lấy kết quả thi |
| → `SubjectTeachingExams` → `SubjectTeachings` → `Subjects` | Navigation chain | — | Lấy tên môn |

**Xử lý:** Nhóm theo môn, tính điểm trung bình.

#### f) Danh sách giảng viên

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `Teachers` | `Teachers.FacultyId == facultyId` | `!IsDeleted` | Lấy danh sách GV |
| → `Users` | `Teachers.UserId → Users.Id` | (Include) | Lấy họ tên, email, ảnh đại diện |

---

### Chức năng 2: Danh sách giảng viên (`GET /api/faculty/teachers`)

**Bảng truy vấn:**

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `Teachers` | `Teachers.FacultyId == facultyId` | `!IsDeleted` | Lấy GV thuộc khoa |
| → `Users` | `Teachers.UserId → Users.Id` | (Include) | Lấy thông tin cá nhân |

---

### Chức năng 3: Lịch giảng dạy toàn khoa (`GET /api/schedule/faculty/{id}`)

**Bảng truy vấn:**

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `Subjects` | `Subjects.FacultyId == facultyId` | `!IsDeleted` | Lấy danh sách môn thuộc khoa |
| `SubjectTeachings` | `SubjectTeachings.SubjectId` ∈ danh sách trên | `!IsDeleted` | Lấy lớp học phần |
| `SubjectSchedules` | `SubjectSchedules.SubjectTeachingId` ∈ danh sách trên | `!IsDeleted` | Lấy tất cả buổi dạy |
| → `SubjectTeachings` → `Subjects` | Navigation property | — | Tên môn, mã môn |
| → `Rooms` | Navigation property | — | Phòng học |
| → `Teachers` → `Users` | Navigation property | — | Tên giảng viên |

---

### Chức năng 4: Thống kê chuyên cần — Nhật ký gần đây (`GET /api/attendance/recent`)

**Bảng truy vấn:**

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `Attendances` | — | Sắp xếp theo thời gian mới nhất, `limit` | Lấy bản ghi điểm danh gần đây |
| → `Students` → `Users` | Navigation property | (Include → ThenInclude) | Lấy tên SV |
| → `SubjectSchedules` | Navigation property | (Include) | Lấy thông tin buổi học |
| → → `SubjectTeachings` → `Subjects` | Navigation chain | (ThenInclude) | Lấy tên môn |

---

## ROLE 99 — ADMIN (Quản trị viên)

### Chức năng 1: Dashboard Admin (`GET /api/admin/dashboard`)

**Mô tả:** Thống kê toàn trường bao gồm KPI, phân bố sinh viên theo khoa/khóa, xu hướng điểm danh, phổ điểm thi.

**Bảng truy vấn & các phép JOIN:**

#### a) KPI tổng quan

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `Students` | — | `!IsDeleted` | Đếm tổng sinh viên |
| `Teachers` | — | `!IsDeleted` | Đếm tổng giảng viên |
| `Faculties` | — | `!IsDeleted` | Đếm tổng khoa |
| `Majors` | — | `!IsDeleted` | Đếm tổng ngành |

#### b) Phân bố sinh viên theo khoa (Treemap)

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `Faculties` | — | `!IsDeleted` | Lấy danh sách khoa |
| `Majors` | `Majors.FacultyId == faculty.Id` | `!IsDeleted` | Lấy ngành thuộc khoa |
| `Students` | `Students.MajorId == major.Id` | `!IsDeleted` | Đếm SV theo ngành |

#### c) Phân bố sinh viên theo khóa & giới tính (Grouped Bar)

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `Students` | — | `!IsDeleted` | Lấy tất cả sinh viên |
| → `AcademicYears` | `Students.AcademicYearId → AcademicYears.Id` | (Include) | Nhóm theo khóa |

**Xử lý:** Nhóm theo `AcademicYear.Name`, đếm Nam (`Gender==1`), Nữ (`Gender==2`).

#### d) Xu hướng điểm danh theo tháng (Multi-line Chart)

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `Attendances` | — | — | Lấy tất cả bản ghi điểm danh |
| → `SubjectSchedules` | `Attendances.SubjectScheduleId → SubjectSchedules.Id` | (Include) | Lấy ngày tháng từ `StartDateTime` |

**Xử lý:** Nhóm theo tháng (`StartDateTime.Month`), đếm từng trạng thái.

#### e) Phổ điểm thi (Histogram)

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `ExamResults` | — | `!IsDeleted`, `Result != null` | Lấy tất cả kết quả thi |

**Xử lý:** Nhóm theo khoảng điểm (0-1, 1-2, ..., 9-10), đếm số lượng.

#### f) Heatmap kết quả thi theo khoa

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `ExamResults` | — | `!IsDeleted`, `Result != null` | Lấy kết quả thi |
| → `SubjectTeachingExams` → `SubjectTeachings` → `Subjects` → `Faculties` | Navigation chain | — | Xác định khoa cho mỗi kết quả |

**Xử lý:** Nhóm theo tên khoa, phân loại kết quả: Kém (<4), Yếu (4-5), TB (5-6.5), Khá (6.5-8), Giỏi (≥8).

---

### Chức năng 2: Nhật ký hoạt động (`GET /api/admin/audit-logs`)

**Bảng truy vấn:**

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `AuditLogs` | — | Sắp xếp theo `Timestamp` giảm dần, `Take(limit)` | Lấy nhật ký gần nhất |

---

### Chức năng 3: Thống kê thiết bị (`GET /api/admin/devices`)

**Bảng truy vấn:**

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `UserDevices` | — | — | Lấy tất cả thiết bị |

**Xử lý:** Nhóm theo `DeviceType` (Desktop/Mobile/Tablet), đếm số lượng.

---

### Chức năng 4: Danh sách thiết bị chi tiết (`GET /api/admin/devices/list`)

**Bảng truy vấn:**

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `UserDevices` | — | Sắp xếp theo `LastLoginTime` giảm dần, `Take(limit)` | Lấy danh sách thiết bị |
| → `Users` | `UserDevices.UserId → Users.Id` | (Include) | Lấy tên người dùng |

---

### Chức năng 5: Cấu hình hệ thống (`GET /api/admin/settings`)

**Bảng truy vấn:**

| Bảng | Khóa JOIN | Điều kiện | Mô tả |
|------|-----------|-----------|-------|
| `SystemSettings` | — | — | Lấy tất cả thiết lập hệ thống |

---

## TỔNG HỢP SƠ ĐỒ QUAN HỆ CÁC BẢNG CHÍNH

```
Users (1) ──── (1) Students        ← UserId
Users (1) ──── (1) Teachers         ← UserId
Students (N) ──── (1) Majors        ← MajorId
Students (N) ──── (1) AcademicYears ← AcademicYearId
Majors (N) ──── (1) Faculties       ← FacultyId
Teachers (N) ──── (1) Faculties     ← FacultyId
Subjects (N) ──── (1) Faculties     ← FacultyId

SubjectTeachings (N) ──── (1) Subjects           ← SubjectId
SubjectTeachingTeachers (N) ──── (1) SubjectTeachings ← SubjectTeachingId
SubjectTeachingTeachers (N) ──── (1) Teachers         ← TeacherId
SubjectStudents (N) ──── (1) SubjectTeachings      ← SubjectTeachingId
SubjectStudents (N) ──── (1) Students               ← StudentId

SubjectSchedules (N) ──── (1) SubjectTeachings ← SubjectTeachingId
SubjectSchedules (N) ──── (1) Rooms            ← RoomId
SubjectSchedules (N) ──── (1) Teachers         ← TeacherId

Attendances (N) ──── (1) Students         ← StudentId
Attendances (N) ──── (1) SubjectSchedules ← SubjectScheduleId

SubjectTeachingExams (N) ──── (1) SubjectTeachings ← SubjectTeachingId
ExamResults (N) ──── (1) SubjectTeachingExams       ← SubjectTeachingExamId
ExamResults (N) ──── (1) Students                    ← StudentId

SemesterPlans (N) ──── (1) Majors         ← MajorId
SemesterPlans (N) ──── (1) AcademicYears  ← AcademicYearId

QuestionSuites (N) ──── (1) Subjects  ← SubjectId
Questions (N) ──── (1) QuestionSuites ← QuestionSuiteId

UserAnnouncements ── chứa UserIds (string, danh sách Guid)
UserDevices (N) ──── (1) Users ← UserId
```
