  1. Role 1 — Sinh Viên (Student):
      • Bằng chứng: Những tài khoản có  Role = 1  đều có tên hiển thị định dạng  "Sinh viên..." , tên đăng nhập bắt đầu bằng  "sinhvien" , mã
      số nội bộ ( UserInternalId ) có tiền tố  SV  (ví dụ:  SV000001 ).
      • Liên kết bảng: Có liên kết trực tiếp và duy nhất tới bảng  Students .
  2. Role 10 — Giáo Viên Chính Thức (Faculty Teacher):
      • Bằng chứng: Có tên định dạng  "Giáo viên..." , mã số nội bộ tiền tố  GV  (ví dụ:  GV000002 ).
      • Liên kết bảng: Có bản ghi liên kết trong bảng  TeacherFaculties  (bảng quản lý nhân sự thuộc Khoa) và có cờ  IsHeadOfFaculty = False 
      (không phải trưởng khoa).
  3. Role 50 — Trưởng Khoa (Dean of Faculty):
      • Bằng chứng: Có tên định dạng  "Giáo viên..."  và mã số nội bộ tiền tố  GV  (ví dụ:  GV000001 ).
      • Liên kết bảng: Có liên kết trong bảng  TeacherFaculties  nhưng có thuộc tính  IsHeadOfFaculty = True  (Trưởng Khoa).
  4. Role 2 — Giáo Viên Thỉnh Giảng (Visiting Teacher):
      • Bằng chứng: Có tên định dạng  "Giáo viên..."  và mã số nội bộ tiền tố  GV .
      • Sự khác biệt: Không có bản ghi trong bảng  TeacherFaculties , nghĩa là họ giảng dạy tự do / thỉnh giảng và không thuộc biên chế quản lý
      cố định của khoa nào.
  5. Role 20 — Trưởng Bộ Môn (Head of Department):
      • Bằng chứng: Có tên định dạng  "Giáo viên..."  và mã số nội bộ tiền tố  GV .
      • Bản chất: Nằm giữa giáo viên thông thường (Role 10) và Trưởng khoa (Role 50) để quản lý nhóm môn học/bộ môn trong khoa.
  6. Role 99 — Quản Trị Viên (Admin):
      • Bằng chứng: Có tên định dạng  "Quản trị viên..." , tên đăng nhập bắt đầu bằng  "admin" , mã số nội bộ tiền tố  AD  (ví dụ:  AD000001 ).
      Không có liên kết tới  Students  hay  TeacherFaculties .
