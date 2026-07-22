# Cách dữ liệu hiển thị trên Dashboard

## 1. Ý tưởng chung

```text
Database Supabase
        ↓
Backend lấy và tính dữ liệu
        ↓
API trả dữ liệu cho Frontend
        ↓
Frontend đưa dữ liệu vào biểu đồ
```

Frontend không tự đoán khoa hay ngành. Backend lấy dữ liệu từ database, đếm/group dữ liệu rồi trả về cho giao diện.

## 2. Dashboard Admin

Admin xem dữ liệu toàn trường.

Frontend gọi:

```text
GET /api/admin/dashboard
```

Backend lấy dữ liệu từ các bảng chính:

```text
Students          → số sinh viên
TeacherFaculties  → số giảng viên
Faculties         → số khoa
Majors            → số ngành
Subjects          → số môn học
```

### Ví dụ Treemap Khoa/Ngành

Để biết sinh viên thuộc khoa/ngành nào, database đi theo quan hệ:

```text
Students.MajorId
    → Majors.Id
    → Majors.FacultyId
    → Faculties.Id
```

Backend group sinh viên theo:

```text
Tên khoa + Tên ngành
```

Ví dụ dữ liệu trả về:

```text
CNOT&KTML | Công Nghệ Ô Tô              | 372
CNOT&KTML | Kỹ thuật máy lạnh & DHKK     | 112
```

Frontend chuyển dữ liệu thành cây:

```text
CNOT&KTML
├── Công Nghệ Ô Tô: 372
└── Kỹ thuật máy lạnh & DHKK: 112
```

Sau đó `Treemap` dùng `count` để quyết định kích thước từng ô.

### Các biểu đồ khác của Admin

- Theo khóa: lấy `Students.AcademicYearId`, group theo khóa.
- Theo giới tính: lấy `Students.Gender`, group theo khóa và giới tính.
- Điểm danh: lấy bảng `Attendances`, group theo `Status` và tháng.
- Kết quả học tập: lấy bảng `ExamResults`, chia điểm thành Kém, Yếu, Trung bình, Khá, Giỏi.
- Kết quả thi theo khoa: từ `ExamResults` đi qua `Student → Major → Faculty`.
- Thiết bị truy cập: lấy bảng `UserDevices`, group theo loại thiết bị.

## 3. Dashboard Trưởng khoa

Trưởng khoa chỉ xem dữ liệu của khoa được gán trong tài khoản.

Frontend lấy `user.facultyId` rồi gọi:

```text
GET /api/faculty/dashboard?facultyId={facultyId}
```

Backend dùng `facultyId` để lọc dữ liệu:

```text
Students.Major.FacultyId = facultyId
TeacherFaculties.FacultyId = facultyId
Majors.FacultyId = facultyId
Subjects.FacultyId = facultyId
```

### Các phần hiển thị

| Phần trên dashboard | Cách lấy dữ liệu |
|---|---|
| Sinh viên trong khoa | Đếm `Students` có ngành thuộc khoa |
| Giảng viên trong khoa | Đếm `TeacherFaculties` theo `FacultyId` |
| Số ngành | Đếm `Majors` theo `FacultyId` |
| Số môn | Đếm `Subjects` theo `FacultyId` |
| Tiến độ môn học | So sánh số buổi đã học và tổng số buổi |
| Chuyên cần | Đếm trạng thái trong `Attendances` |
| Điểm trung bình môn | Tính trung bình `ExamResults` theo môn |
| Đánh giá giảng viên | Tính trung bình `StudentEvaluationDetails` |
| Danh sách giảng viên | Nối `TeacherFaculties` với `Users` |
| Lịch giảng dạy | Lấy từ `SubjectSchedules` |

## 4. Vì sao Admin tách được ngành còn Trưởng khoa chưa tách?

Admin group trực tiếp theo:

```text
FacultyName + MajorName
```

nên hiển thị được từng ngành.

Dashboard Trưởng khoa hiện chỉ lọc theo:

```text
Subject.FacultyId
```

nên các môn của nhiều ngành trong cùng khoa bị gộp chung.

Muốn tách môn theo ngành, cần nối thêm:

```text
Subjects
    → SemesterSubjects
    → SemesterPlans
    → Majors
```

## 5. Dữ liệu thật và dữ liệu mẫu

Khi API hoạt động, dashboard dùng dữ liệu thật từ Supabase.

Nếu API lỗi, một số màn hình dùng dữ liệu mẫu trong:

```text
frontend/src/mock/mockData.ts
```

Vì vậy cần nhìn trạng thái trên giao diện:

```text
Dữ liệu Live (Supabase DB)  → dữ liệu thật
API không khả dụng           → dữ liệu mẫu hoặc không có dữ liệu
```

## 6. Tóm tắt dễ nhớ

```text
Admin:
  Lấy toàn trường
  Group theo Khoa + Ngành
  Hiển thị Treemap và các thống kê tổng quát

Trưởng khoa:
  Lấy theo facultyId của tài khoản
  Lọc trong một khoa
  Hiển thị KPI, điểm danh, điểm số, giảng viên và lịch học
```
