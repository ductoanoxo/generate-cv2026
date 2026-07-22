# 📘 Database Index & Score Query Plan (Ngày 3)

**Mục tiêu**: Hỗ trợ Minh Hải chuẩn bị và triển khai các thành phần cho Ngày 3 bao gồm:
1. Thực thi SQL tạo **4 Critical Database Indexes** trên Supabase PostgreSQL.
2. Tạo DTO và viết Service `CVScoreQueryService.cs` trong Backend .NET 8.
3. Cấu hình DI và expose endpoint `GET /api/student/{id}/scores/filtered`.

---

## 💾 1. SQL Đặt 4 Critical Indexes Trên Supabase PostgreSQL

Dựa trên cấu trúc database thực tế của `TayDoV2` (từ file [TayDoV2_schema.sql](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/TayDoV2_schema.sql) và mapping EF Core tại [AppDbContext.cs](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/Data/AppDbContext.cs)), câu query điểm số sẽ thực hiện JOIN qua 4 bảng: `ExamResults` ➡️ `SubjectTeachingExams` ➡️ `SubjectTeachings` ➡️ `Subjects`.

Dưới đây là mã SQL tối ưu sử dụng **Partial Indexes** và **Covering Indexes** (với mệnh đề `INCLUDE` để tránh Key Lookup / RID Lookup trên đĩa):

```sql
-- INDEX 1: Tối ưu lọc điểm thi theo StudentId và CombinedResult trên bảng ExamResults
-- Chỉ index các bản ghi chưa bị xóa (IsDeleted = false)
CREATE INDEX IF NOT EXISTS "IX_ExamResults_StudentId_CombinedResult_Filtered"
ON "ExamResults" ("StudentId", "CombinedResult")
INCLUDE ("SubjectTeachingExamId", "Result")
WHERE "IsDeleted" = false;

-- INDEX 2: Tối ưu join trên bảng trung gian SubjectTeachingExams
CREATE INDEX IF NOT EXISTS "IX_SubjectTeachingExams_Join_Helper"
ON "SubjectTeachingExams" ("Id")
INCLUDE ("SubjectTeachingId")
WHERE "IsDeleted" = false;

-- INDEX 3: Tối ưu join trên bảng trung gian SubjectTeachings
CREATE INDEX IF NOT EXISTS "IX_SubjectTeachings_Join_Helper"
ON "SubjectTeachings" ("Id")
INCLUDE ("SubjectId")
WHERE "IsDeleted" = false;

-- INDEX 4: Tối ưu lookup thông tin môn học hoạt động trên bảng Subjects
CREATE INDEX IF NOT EXISTS "IX_Subjects_Active_Lookup"
ON "Subjects" ("Id")
INCLUDE ("SubjectCode", "Name", "CreditPoint")
WHERE "IsDeleted" = false AND "IsActived" = true;
```

> [!TIP]
> **Cách kiểm tra Index**: Sau khi chạy SQL trên Supabase Console, bạn có thể kiểm tra hiệu năng bằng cách chạy:
> ```sql
> EXPLAIN ANALYZE
> SELECT s."Id", s."SubjectCode", s."Name", er."CombinedResult"
> FROM "ExamResults" er
> INNER JOIN "SubjectTeachingExams" ste ON er."SubjectTeachingExamId" = ste."Id"
> INNER JOIN "SubjectTeachings" st ON ste."SubjectTeachingId" = st."Id"
> INNER JOIN "Subjects" s ON st."SubjectId" = s."Id"
> WHERE er."StudentId" = 'STUDENT_GUID_TEST_HERE'
>   AND er."IsDeleted" = false
>   AND er."CombinedResult" >= 7.0;
> ```
> Kết quả cần đảm bảo sử dụng **Index Scan** hoặc **Index Only Scan** thay vì **Seq Scan** (quét tuần tự).

---

## 🛠️ 2. Xây Dựng Mã Nguồn .NET 8 Backend

Bạn có thể viết trước các file này trên một nhánh git phụ (ví dụ: `feature/minhhai-n3-prep`) để không ảnh hưởng đến ngày làm việc của Đức Toàn trên branch chính.

### 🔹 Bước 2.1: Tạo DTO `CourseScoreDto.cs`
Tạo file mới tại [backend/DTOs/Student/CourseScoreDto.cs](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/DTOs/Student/CourseScoreDto.cs):

```csharp
using System;

namespace backend.DTOs.Student
{
    public class CourseScoreDto
    {
        public Guid SubjectId { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public float CombinedResult { get; set; }
        public float? Result { get; set; }
        public int CreditPoint { get; set; }
    }
}
```

### 🔹 Bước 2.2: Tạo Service `CVScoreQueryService.cs`
Tạo file mới tại [backend/Services/CVScoreQueryService.cs](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/Services/CVScoreQueryService.cs):

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs.Student;

namespace backend.Services
{
    public interface ICVScoreQueryService
    {
        Task<IEnumerable<CourseScoreDto>> GetFilteredScoresAsync(Guid studentId);
    }

    public class CVScoreQueryService : ICVScoreQueryService
    {
        private readonly AppDbContext _context;

        public CVScoreQueryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CourseScoreDto>> GetFilteredScoresAsync(Guid studentId)
        {
            return await _context.ExamResults
                .Include(er => er.SubjectTeachingExam)
                    .ThenInclude(ste => ste.SubjectTeaching)
                        .ThenInclude(st => st.Subject)
                .Where(er => er.StudentId == studentId 
                    && !er.IsDeleted 
                    && er.CombinedResult >= 7.0f
                    && er.SubjectTeachingExam != null 
                    && !er.SubjectTeachingExam.IsDeleted 
                    && er.SubjectTeachingExam.SubjectTeaching != null 
                    && !er.SubjectTeachingExam.SubjectTeaching.IsDeleted
                    && er.SubjectTeachingExam.SubjectTeaching.Subject != null
                    && !er.SubjectTeachingExam.SubjectTeaching.Subject.IsDeleted
                    && er.SubjectTeachingExam.SubjectTeaching.Subject.IsActived)
                .Select(er => new CourseScoreDto
                {
                    SubjectId = er.SubjectTeachingExam.SubjectTeaching.Subject.Id,
                    SubjectCode = er.SubjectTeachingExam.SubjectTeaching.Subject.SubjectCode,
                    SubjectName = er.SubjectTeachingExam.SubjectTeaching.Subject.Name,
                    CombinedResult = er.CombinedResult ?? 0f,
                    Result = er.Result,
                    CreditPoint = er.SubjectTeachingExam.SubjectTeaching.Subject.CreditPoint
                })
                .ToListAsync();
        }
    }
}
```

### 🔹 Bước 2.3: Đăng Ký DI Trong `Program.cs`
Mở file [Program.cs](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/Program.cs) và đăng ký service mới tại khu vực đăng ký Dependency Injection (khoảng dòng 37):

```csharp
// Đăng ký CV Score Query Service
builder.Services.AddScoped<ICVScoreQueryService, CVScoreQueryService>();
```

### 🔹 Bước 2.4: Thêm Endpoint Vào `StudentDashboardController.cs`
Mở file [StudentDashboardController.cs](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/Controllers/StudentDashboardController.cs).
1. Thêm dependency `ICVScoreQueryService` vào constructor.
2. Viết API endpoint `GET /api/student/{id}/scores/filtered`.

```csharp
// 1. Thêm trường private
private readonly ICVScoreQueryService _cvScoreService;

// 2. Cập nhật Constructor (tiêm thêm ICVScoreQueryService)
public StudentDashboardController(
    IStudentDashboardService studentService, 
    AppDbContext context,
    ICVScoreQueryService cvScoreService) // <-- Thêm ở đây
{
    _studentService = studentService;
    _context = context;
    _cvScoreService = cvScoreService; // <-- Gán ở đây
}

// 3. Viết endpoint mới
[HttpGet("{id}/scores/filtered")]
public async Task<IActionResult> GetFilteredScores(string id)
{
    var resolvedId = await ResolveStudentIdAsync(id);
    if (resolvedId == Guid.Empty)
    {
        return NotFound(new { message = "Không tìm thấy sinh viên" });
    }
    
    var scores = await _cvScoreService.GetFilteredScoresAsync(resolvedId);
    return Ok(scores);
}
```

---

## 💡 3. Các Bước Kiểm Thử Sớm (Local Test)

1. **Test Query**: Sau khi code xong, bạn chạy project backend .NET và test endpoint qua Swagger (truy cập `http://localhost:5000/swagger` hoặc `http://localhost:8080/swagger` tùy cấu hình docker/local).
2. **Đối chiếu API**: Endpoint này trả về danh sách các học phần có điểm số $\ge 7.0$ dưới dạng JSON. Đây sẽ là nguồn cấp dữ liệu trực tiếp cho AI Service (LangGraph pipeline ở Ngày 9) và giao diện hiển thị môn học (Đức Toàn làm ở Ngày 4).
