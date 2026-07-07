# 🏫 Teacher Dashboard Module - Fullstack Integration (Dev B)

Chào bạn, dựa theo tài liệu thiết kế và phân chia công việc cho **Dev B**, mình đã triển khai và hoàn thiện cả phần **Backend (DTO, Service, Controller)** và **Frontend (React UI)** để kết nối dữ liệu và hiển thị trạng thái kết nối trực tiếp.

Dưới đây là chi tiết các thay đổi và hướng dẫn kiểm thử phân hệ **Teacher Dashboard**:

---

## 📁 1. Danh sách Files Triển Khai

### 🗂️ Data Transfer Objects (DTOs)
Nằm tại thư mục [backend/DTOs/Teacher/](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/DTOs/Teacher):
1. **[TeacherDashboardDto.cs](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/DTOs/Teacher/TeacherDashboardDto.cs)**: Gói thông tin tổng quan của Dashboard (KPIs, lớp dạy, lịch dạy hôm nay, điểm danh, cảnh báo).
2. **[TeacherClassDto.cs](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/DTOs/Teacher/TeacherClassDto.cs)**: Định nghĩa lớp học phần giảng dạy (Khóa chính `Guid`).
3. **[TeacherScheduleDto.cs](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/DTOs/Teacher/TeacherScheduleDto.cs)**: Định nghĩa lịch giảng dạy (Khóa chính `Guid`).
4. **[AttendanceStatDto.cs](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/DTOs/Teacher/AttendanceStatDto.cs)**: Phân bố điểm danh trung bình.
5. **[AlertStudentDto.cs](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/DTOs/Teacher/AlertStudentDto.cs)**: Học viên cần chú ý đặc biệt.
6. **[QuestionSuiteDto.cs](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/DTOs/Teacher/QuestionSuiteDto.cs)**: Cấu trúc ngân hàng đề thi (Khóa chính `Guid`, thời gian `DateTime`).

### 🛠️ Services & Controllers (Backend)
Nằm tại [backend/Services/](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/Services) và [backend/Controllers/](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/Controllers):
- **[ITeacherDashboardService.cs](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/Services/ITeacherDashboardService.cs)** & **[TeacherDashboardService.cs](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/Services/TeacherDashboardService.cs)**: Nhận tham số định kiểu `Guid` để truy vấn/mock dữ liệu an toàn.
- **[TeacherDashboardController.cs](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/Controllers/TeacherDashboardController.cs)**: Cung cấp API endpoints kết xuất dữ liệu strongly-typed.
- **[ScheduleService.cs](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/backend/Services/ScheduleService.cs)**: Cập nhật hàm `GetScheduleByTeacherAsync` trả về toàn bộ danh sách lịch dạy đầy đủ trong tuần cho giáo viên khớp với frontend.

### 💻 Giao diện Frontend React (Vite + TypeScript)
Nằm tại thư mục [frontend/src/pages/teacher/](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/frontend/src/pages/teacher):
1. **[TeacherDashboard.tsx](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/frontend/src/pages/teacher/TeacherDashboard.tsx)** (Trang chủ Dashboard):
   - Sử dụng **Axios** kết nối tới API Backend: `GET http://localhost:5000/api/teacher/dashboard?teacherId=...`
   - Nhận diện ID mặc định của giảng viên (`gv_nam` là `'u4'`) để tự động chuyển đổi sang định dạng Guid hợp lệ (`d3b07384-d113-49be-a5d2-000000000000`) nhằm tránh lỗi phân tích UUID phía Backend.
   - **Cơ chế phục hồi (Resiliency)**: Nếu Backend API ngoại tuyến, trang web sẽ hiển thị một cảnh báo nhỏ và tự động chuyển đổi sang dùng dữ liệu giả lập cục bộ (Local Mock) để bảo toàn giao diện không bị lỗi.
   - **Đèn báo trạng thái (Connection Indicator)**: Hiển thị nhãn kết nối màu xanh lá (Đã kết nối Backend API) hoặc màu vàng (Dữ liệu Giả lập) trực quan trên đỉnh trang.
2. **[TeacherExamsPage.tsx](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/frontend/src/pages/teacher/TeacherExamsPage.tsx)** (Quản lý đề thi):
   - Kết nối tới API `GET http://localhost:5000/api/teacher/question-suites?teacherId=...` để hiển thị danh sách ngân hàng đề thi thực tế từ backend.
3. **[TeacherSchedulePage.tsx](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/frontend/src/pages/teacher/TeacherSchedulePage.tsx)** (Lịch giảng dạy chi tiết):
   - Kết nối tới API `GET http://localhost:5000/api/schedule/teacher/{teacherId}` để lấy toàn bộ danh sách lịch dạy chi tiết các tiết học của giảng viên trong tuần từ backend.
   - Tích hợp đầy đủ cơ chế tự phục hồi và hiển thị nhãn kết nối đồng bộ.

---

## 🚦 2. Hướng Dẫn Kích Hoạt & Kiểm Thử (How to Test)

Bạn có thể chạy thử nghiệm theo 2 cách dưới đây:

### Cách 1: Chạy bằng Docker Compose (Khuyên dùng)
1. Mở Terminal tại thư mục gốc của dự án.
2. Khởi động các container bằng lệnh:
   ```bash
   docker compose up -d --build
   ```
3. Truy cập giao diện tại: `http://localhost:3000`.
4. Đăng nhập nhanh với tài khoản giảng viên: **gv_nam**.
5. Bạn sẽ thấy nhãn trạng thái: **Đã kết nối Backend API (.NET 8)** màu xanh lá cây cực kỳ đẹp mắt ở cả 3 trang: Dashboard, Lịch giảng dạy và Ngân hàng câu hỏi.

### Cách 2: Chạy thủ công trên Local
1. **Chạy Backend**:
   ```bash
   cd backend
   dotnet run
   ```
   *Lưu ý: API sẽ mở tại cổng cấu hình mặc định (ví dụ: `http://localhost:5000`).*
2. **Chạy Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
3. Đăng nhập bằng tài khoản **gv_nam** tại `http://localhost:5173` để kiểm thử tương tự.
