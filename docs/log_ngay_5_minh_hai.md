# 📝 BÁO CÁO LOG BÀN GIAO NGÀY 5 (MINH HẢI)

### **Tên công việc**:
Xây dựng giao diện nhập thông tin dự án, kinh nghiệm thực tập, chứng chỉ; tạo biểu đồ đánh giá kỹ năng và hoàn thiện chức năng tải file CV PDF.

---

### **Mô tả quy trình**:

- Đầu tiên, em cập nhật lại cấu trúc dữ liệu của hồ sơ CV để chuẩn bị sẵn thông tin cho các phần nhập mới như kinh nghiệm thực tập và chứng chỉ.

- Tiếp theo, em xây dựng giao diện nhập dự án cá nhân riêng biệt.
  + Ở phần này, em tạo thêm ô nhập link GitHub cùng nút bấm tự động lấy thông tin dự án.
  + Em cũng làm sẵn phần dữ liệu giả định để giao diện tự điền thông tin dự án mẫu giúp anh Toàn dễ dàng nối API ở Ngày 6.

- Sau đó, em tiếp tục tạo giao diện nhập thông tin cho phần kinh nghiệm thực tập và chứng chỉ đạt được của sinh viên, hỗ trợ việc thêm hoặc xóa thông tin trực tiếp.

- Tiếp theo, em xây dựng biểu đồ mạng nhện (Radar Chart) để trực quan hóa năng lực kỹ năng.
  + Biểu đồ này sẽ tự động gom các môn học thành 5 nhóm kỹ năng chính (như Web, C#, Cơ sở dữ liệu...) và tính điểm trung bình dựa trên các môn học sinh viên đã chọn.
  + Mỗi khi sinh viên tích hoặc bỏ chọn môn học ở Bước 1 thì biểu đồ kỹ năng sẽ tự động cập nhật theo.

- Kế tiếp, em đưa toàn bộ các phần nhập liệu mới và biểu đồ kỹ năng vào màn hình biên tập CV ở Bước 2.
  + Em xử lý luôn lỗi bị lặp lại môn học trên bảng đối soát để đảm bảo mỗi môn chỉ hiển thị 1 lần với điểm số cao nhất.
  + Em cũng cập nhật lại tờ xem trước CV chuẩn khổ giấy A4 để hiển thị đầy đủ các thông tin thực tập và chứng chỉ vừa thêm.

- Cuối cùng, em hoàn thiện chức năng xuất CV sang file PDF.
  + Em tích hợp công cụ hỗ trợ cho phép sinh viên bấm nút là tải thẳng file PDF chất lượng cao về máy tính.
  + Đồng thời em tinh chỉnh lại giao diện in để khi bấm in thì hệ thống tự động ẩn đi các nút bấm, thanh menu và chỉ giữ lại đúng tờ CV A4.
