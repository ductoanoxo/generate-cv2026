# 📋 KẾ HOẠCH TIẾP THEO: SỬA BLOCKER QDRANT & TRIỂN KHAI NGÀY 3 (MINH HẢI)

## 🔍 1. Phân Tích Hiện Trạng & Blocker Sau Ngày 2 (Đức Toàn)

Đức Toàn đã hoàn thành các nhiệm vụ của Ngày 2 bao gồm:
* Parse tài liệu chương trình đào tạo khoa CNTT thành Markdown bằng **Docling**.
* Sinh vector bằng model **`text-embedding-3-small`** từ OpenAI.
* Chuẩn bị script nạp dữ liệu (seed) môn học và CLO lên Qdrant.

### 🛑 Nguyên nhân Đức Toàn không nạp được dữ liệu lên Cloud Qdrant:
1. **Lỗi logic trong script `seed_vectors.py`**:
   * Tại file [seed_vectors.py](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/ai-service/scripts/seed_vectors.py#L126-L127):
     ```python
     target_url = sys.argv[1] if len(sys.argv) > 1 else os.getenv("QDRANT_URL", "http://localhost:6333")
     ```
   * Khi chạy script trực tiếp bằng `python scripts/seed_vectors.py` không truyền tham số, script sẽ lấy giá trị `os.getenv("QDRANT_URL")`. Do môi trường terminal chạy script chưa được load file `.env` (vì module `os` không tự động load `.env`), giá trị này bị `None`, dẫn đến script tự động fall back về giá trị mặc định là `"http://localhost:6333"` thay vì sử dụng cấu hình Cloud Qdrant đã load trong đối tượng `settings.QDRANT_URL` (được khai báo tại [config.py](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/ai-service/app/config.py)).
   * Do đó, quá trình seeding bị chuyển hướng về local Qdrant ở cổng `6333` thay vì Cloud Qdrant.
2. **Hardcode localhost trong `test_day2.py`**:
   * Tại file [test_day2.py](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/ai-service/test_day2.py#L34-L36) đang hardcode cổng cục bộ:
     ```python
     seed_qdrant("http://localhost:6333")
     client = QdrantClient(url="http://localhost:6333")
     ```
   * Điều này khiến quá trình kiểm thử tự động của Đức Toàn luôn chỉ kết nối tới Qdrant local.

---

## 🛠️ 2. Hành Động Cần Làm Ngay (Dành Cho Bạn/User)

Để gỡ blocker cho toàn bộ dự án và chuẩn bị môi trường cho Ngày 3, bạn cần thực hiện các bước sau:

### Bước 2.1: Sửa logic fallback QDRANT_URL trong `seed_vectors.py`
Thay thế đoạn code khởi tạo `target_url` ở cuối file [seed_vectors.py](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/ai-service/scripts/seed_vectors.py#L125-L127) từ:
```python
if __name__ == "__main__":
    target_url = sys.argv[1] if len(sys.argv) > 1 else os.getenv("QDRANT_URL", "http://localhost:6333")
    seed_qdrant(qdrant_url=target_url)
```
thành:
```python
if __name__ == "__main__":
    # Sử dụng settings.QDRANT_URL (đã load tự động từ file .env qua Pydantic Settings) làm fallback mặc định
    target_url = sys.argv[1] if len(sys.argv) > 1 else settings.QDRANT_URL
    seed_qdrant(qdrant_url=target_url)
```

### Bước 2.2: Đồng bộ hóa cấu hình file `.env`
Đảm bảo file [ai-service/.env](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/ai-service/.env) đã khai báo chính xác địa chỉ cloud và API key:
```env
QDRANT_URL=https://aa71a8ca-2dae-4899-ac5c-25571bf64790.us-east-2-0.aws.cloud.qdrant.io
QDRANT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIiwic3ViamVjdCI6ImFwaS1rZXk6ODM5YjM4NGYtMTRiNC00OWViLWFlZTgtZmUyZmM5NTZjMmY2In0.QzrXz_W5WOviom2AVdKOfw8og9_dIgc_8G-SiPM0PJI
```

### Bước 2.3: Chạy seeding nạp dữ liệu môn học lên Cloud
Mở terminal tại thư mục `ai-service/` (hoặc chạy trong docker container của `ai-service` đã load env) và thực hiện lệnh:
```bash
# Cài đặt các thư viện cần thiết nếu chưa cài ở local
pip install -r requirements.txt

# Chạy script seeding sử dụng cấu hình trong .env
python scripts/seed_vectors.py
```
*Lưu ý:* Khi chạy thành công, log sẽ in ra dạng: `Successfully seeded X vectors (Subjects + CLOs) into Qdrant!`.

---

## 📅 3. Nhiệm Vụ Ngày 3: Supabase Indexes & .NET Score Query API (Minh Hải làm)

Sau khi Qdrant Cloud đã có dữ liệu từ bước trên, Minh Hải sẽ bắt đầu triển khai các tác vụ Backend & Database của Ngày 3 theo đúng phân công trong [phan_cong_generate_cv.md](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/docs/phan_cong_generate_cv.md):

### 💾 Tác vụ 3.1: Thực thi tạo 4 Indexes tối ưu trên Supabase
Mở Supabase SQL Editor và thực thi đoạn SQL sau để tối ưu hóa truy vấn JOIN qua 4 bảng (`ExamResults` ➡️ `SubjectTeachingExams` ➡️ `SubjectTeachings` ➡️ `Subjects`):
```sql
-- INDEX 1: Tối ưu lọc điểm thi theo StudentId và CombinedResult >= 7.0 trên bảng ExamResults
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

-- INDEX 4: Tối ưu lookup môn học hoạt động trên bảng Subjects
CREATE INDEX IF NOT EXISTS "IX_Subjects_Active_Lookup"
ON "Subjects" ("Id")
INCLUDE ("SubjectCode", "Name", "CreditPoint")
WHERE "IsDeleted" = false AND "IsActived" = true;
```

### 🛠️ Tác vụ 3.2: Phát triển .NET 8 Backend API
Minh Hải cần tạo và chỉnh sửa các file mã nguồn sau ở Backend:

1. **Tạo DTO** `CourseScoreDto.cs` tại [backend/DTOs/Student/CourseScoreDto.cs](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/DTOs/Student/CourseScoreDto.cs):
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

2. **Tạo Service** `CVScoreQueryService.cs` tại [backend/Services/CVScoreQueryService.cs](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/Services/CVScoreQueryService.cs) để lọc điểm thi $\ge 7.0$ của sinh viên.

3. **Đăng ký Dependency Injection** trong [Program.cs](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/Program.cs):
   ```csharp
   builder.Services.AddScoped<ICVScoreQueryService, CVScoreQueryService>();
   ```

4. **Expose endpoint** `GET /api/student/{id}/scores/filtered` trong [StudentDashboardController.cs](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/Controllers/StudentDashboardController.cs) bằng cách tiêm `ICVScoreQueryService` vào constructor và viết action xử lý.

### 🧪 Tác vụ 3.3: Kiểm thử
* Khởi chạy backend và truy cập Swagger (`http://localhost:5000/swagger` hoặc port local của dự án) để kiểm tra xem API trả về đúng danh sách môn học của sinh viên có điểm $\ge 7.0$ hay không.

---

## 🛡️ Quy Tắc Bàn Giao Hàng Ngày
* **Thời gian hoàn thành**: Trước 22:00 hôm nay (Thứ Sáu - Ngày 3), Minh Hải phải push code lên branch `minhhai`.
* **Ghi log bàn giao 3 dòng**: Báo cáo lên group chat những gì đã làm, endpoint mới nào đã sẵn sàng, lưu ý kỹ thuật gì cho Đức Toàn để ngày mai (Ngày 4) Đức Toàn làm Frontend JD Input & Bảng môn học.
