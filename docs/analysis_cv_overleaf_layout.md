# Phân tích nhiệm vụ: bố cục CV theo mẫu IIIT Vadodara

## Mục tiêu

Điều chỉnh cấu trúc trình bày CV để tham chiếu mẫu [IIIT Vadodara Resume](https://www.overleaf.com/latex/templates/iiit-vadodara-resume/crrpnvzhktfs.pdf): CV một cột, gọn, ưu tiên thông tin học thuật và dự án theo các dòng tiêu đề căn trái-phải.

Phạm vi yêu cầu gồm:

1. Phần thông tin cá nhân đầu trang có bố cục tương tự mẫu.
2. Thêm mục **Education** có bố cục tương tự mẫu.
3. Đổi bố cục mục **Projects**: tên dự án in đậm ở bên trái, thời gian ở bên phải, kỹ năng/công nghệ ở dòng dưới.
4. Thời gian dự án dùng tháng/năm, ví dụ `08/2024 - 07/2026` hoặc `07/2025 - now`.

Tài liệu này chỉ phân tích nhiệm vụ; không tự thực hiện thay đổi mã nguồn.

## Bố cục tham chiếu

Mẫu PDF có cấu trúc một cột với các đặc điểm cần giữ lại:

```text
HỌ VÀ TÊN                                                    Điện thoại
Mã sinh viên                                                  Email cá nhân
Chương trình học / ngành                                      Email trường
Học phần / chuyên ngành                                       GitHub
Tên trường                                                    LinkedIn
────────────────────────────────────────────────────────────────────────
EDUCATION
• Tên trường / cơ sở đào tạo                                  Năm học
  Bằng cấp, ngành học                                          GPA / Percentage

PROJECTS
• Tên dự án                                                    Thời gian
  Mô tả hoặc vai trò
  Tools & technologies used: React, .NET, PostgreSQL
  Kết quả/đóng góp (nếu có)
```

Đây là tham chiếu về phân cấp thông tin và cách căn chỉnh, không phải yêu cầu sao chép nguyên văn kiểu chữ, nhận diện trường IIIT, hay nội dung mẫu.

## Hiện trạng dự án

### Dữ liệu CV hiện có

`CVData.profile` hiện có các trường phù hợp để xây phần đầu và Education cơ bản: `fullName`, `studentCode`, `email`, `phoneNumber`, `faculty`, `major`, `academicYear`, `gpa`, và `hometown`.

`CVData.projects` và `Project` hiện chỉ gồm:

```ts
{
  name: string;
  role: string;
  description: string;
  technologies: string[];
}
```

Chưa có trường thời gian dự án. Đây là thiếu hụt dữ liệu cần bổ sung trước khi UI/PDF có thể hiển thị đúng yêu cầu.

### Điểm render hiện tại

- `frontend/src/components/CVPreview.tsx` đang render header, projects và preview/export target.
- `frontend/src/components/ProjectForm.tsx` là biểu mẫu thêm dự án thủ công và nhận dự án từ GitHub.
- `frontend/src/mock/mockData.ts` định nghĩa `CVData` và kiểu dữ liệu frontend.
- `ai-service/app/models/schemas.py` định nghĩa payload PDF phía AI Service.
- `ai-service/app/templates/modern.html` và `ai-service/app/templates/classic.html` render PDF WeasyPrint.
- `ai-service/app/services/export_service.py` có luồng tạo DOCX; nếu yêu cầu layout áp dụng cho mọi định dạng xuất, luồng này cũng cần được đồng bộ.

## Công việc cần thực hiện

### 1. Chuẩn hóa dữ liệu thời gian dự án

Thêm hai trường tùy chọn vào project ở mọi lớp dữ liệu liên quan:

```ts
startDate?: string; // định dạng YYYY-MM
endDate?: string;   // định dạng YYYY-MM; rỗng/null khi đang thực hiện
```

Quy tắc hiển thị duy nhất:

| Dữ liệu | Giá trị hiển thị |
| --- | --- |
| `startDate = 2024-08`, `endDate = 2026-07` | `08/2024 - 07/2026` |
| `startDate = 2025-07`, `endDate` rỗng | `07/2025 - now` |
| Không có `startDate` | Không render cột thời gian, không tạo placeholder |

Nên dùng input HTML `type="month"` trong form dự án để bảo đảm người dùng chỉ nhập tháng/năm. Không lưu chuỗi đã định dạng như `08/2024 - 07/2026`; chỉ định dạng ở lớp hiển thị qua một helper dùng chung.

Các điểm cần đồng bộ kiểu dữ liệu/payload:

- `Project` trong `ProjectForm.tsx`.
- `CVData.projects` trong `mockData.ts` và mọi dữ liệu mặc định/mapping kết quả AI.
- `ProjectSchema` trong `ai-service/app/models/schemas.py`.
- Dữ liệu project gửi/nhận tại `CVBuilder.tsx`, pipeline AI, lưu CV và endpoint export.

Quyết định mặc định đề xuất: ngày kết thúc trống nghĩa là dự án đang thực hiện, được hiển thị là `now`; không cần thêm boolean `isCurrent` để tránh hai nguồn trạng thái.

### 2. Thiết kế lại thông tin cá nhân đầu trang

Thay header hiện tại bằng block một cột theo mẫu:

- Dòng 1: `HỌ VÀ TÊN` in hoa, đậm, cỡ lớn ở trái; `phoneNumber` ở phải.
- Dòng 2: `studentCode` ở trái; `email` ở phải.
- Dòng 3: `major` ở trái; email trường (nếu hệ thống phân biệt được, nếu không dùng `email`) ở phải.
- Dòng 4: `faculty` hoặc chuyên ngành ở trái; liên kết GitHub/LinkedIn ở phải, chỉ hiển thị khi dữ liệu đã tồn tại.
- Dòng 5: tên trường cố định `Trường Cao đẳng Tây Đô` ở trái. Không tự tạo GitHub/LinkedIn từ dữ liệu không có sẵn.

Các dòng phải tự xuống hàng hợp lý trên màn hình hẹp và khi dữ liệu dài. Bản PDF cần duy trì căn lề trái-phải bằng layout nội bộ nhỏ, không áp dụng flex/grid cho toàn bộ tài liệu PDF.

### 3. Thêm mục Education

Chèn **Education** sau phần thông tin cá nhân và trước Projects/Experience để tương đương thứ bậc trong mẫu.

Với dữ liệu sinh viên hiện có, phiên bản đầu tiên chỉ có một education item:

- Tiêu đề trái (in đậm): `Trường Cao đẳng Tây Đô`.
- Thời gian phải: lấy từ `academicYear` nếu dữ liệu có thể chuẩn hóa thành khoảng năm; nếu không chuẩn hóa được, hiển thị nguyên `academicYear` ở bên phải.
- Dòng 2 trái: `major`, có thể kèm `faculty` khi khác rỗng.
- Dòng 2 phải: `GPA: {gpa}` chỉ hiển thị nếu GPA lớn hơn 0.

Không thêm trường education array trong phiên bản này, vì hệ thống chỉ đang quản lý một chương trình đào tạo chính. Nếu sau này cần THPT/chứng chỉ đào tạo, mở rộng bằng `education[]` riêng thay vì chèn dữ liệu giả vào profile.

### 4. Đổi bố cục Projects

Mỗi project là một item độc lập, không phải một card nhiều màu:

- Hàng đầu: `• Tên dự án` in đậm ở trái; khoảng thời gian đã định dạng ở phải.
- Hàng hai: `Vai trò: {role}` hoặc mô tả ngắn ở trái; không có dữ liệu thì ẩn dòng.
- Hàng ba: `Skills: {technologies.join(', ')}` / `Tools & technologies used: ...`; giữ bên dưới tên dự án theo yêu cầu.
- Hàng bốn: mô tả/đóng góp/kết quả của `description`, chỉ render khi không rỗng.

Tên dự án và khoảng thời gian phải nằm trên cùng hàng khi còn chỗ. Khi tên dài, cho phép tên xuống dòng nhưng thời gian không bị che, tràn ra ngoài hay chồng chữ. Một project được giữ nguyên trang bằng `break-inside: avoid` chỉ khi bản thân item vừa trong vùng in; section Projects tổng không được khóa ngắt trang.

### 5. Đồng bộ các bản render

Bố cục mới phải thống nhất trong:

- Preview và đối tượng export PDF của frontend (`CVPreview.tsx`, stylesheet liên quan).
- Hai template PDF WeasyPrint (`modern.html`, `classic.html`).
- DOCX chỉ khi sản phẩm xác nhận yêu cầu “layout tương tự” áp dụng cả DOCX; nếu không, giữ DOCX ngoài phạm vi thay đổi này và ghi rõ trong bàn giao.

Mọi CSS mới phải tuân thủ các yêu cầu phân trang tại `docs/analysis_pdf_page_overflow.md`: lề `@page` an toàn, natural overflow, không khóa height/overflow ở wrapper export, không khóa section lớn, và chỉ chống ngắt ở item nhỏ.

## Files dự kiến ảnh hưởng

| Nhóm | File | Mục đích |
| --- | --- | --- |
| Kiểu dữ liệu frontend | `frontend/src/mock/mockData.ts` | Bổ sung ngày bắt đầu/kết thúc project. |
| Form dự án | `frontend/src/components/ProjectForm.tsx` | Nhập và hiển thị thông tin tháng/năm. |
| Preview/PDF frontend | `frontend/src/components/CVPreview.tsx`, `frontend/src/index.css` | Render header, Education và project layout. |
| Điều phối dữ liệu CV | `frontend/src/pages/student/CVBuilder.tsx` | Giữ ngày project khi thêm, sửa, sinh và xuất CV. |
| Schema/template PDF | `ai-service/app/models/schemas.py`, `ai-service/app/templates/modern.html`, `ai-service/app/templates/classic.html` | Nhận dữ liệu và render nhất quán trong WeasyPrint. |

Trước khi sửa, agent cần tìm các mapping/lưu trữ project bổ sung ngoài danh sách này để không làm rơi `startDate`/`endDate` trong luồng AI hoặc CV đã lưu.

## Kiểm thử và tiêu chí nghiệm thu

1. Header hiển thị đúng họ tên, liên hệ và dữ liệu học tập; trường thiếu dữ liệu không tạo dòng rỗng.
2. Education hiển thị tên trường, ngành/khoa, niên khóa và GPA theo điều kiện dữ liệu.
3. Project có tên đậm ở trái, ngày ở phải, technologies ở dòng dưới; ví dụ render đúng `08/2024 - 07/2026` và `07/2025 - now`.
4. Các dự án cũ không có ngày vẫn render bình thường, không lỗi TypeScript/Pydantic/API.
5. Preview frontend và PDF WeasyPrint hiển thị cùng thứ tự và thông tin cốt lõi.
6. CV dài nhiều trang không bị cắt nội dung, đặc biệt tại cuối trang trong Education/Projects; tuân thủ checklist tại `analysis_pdf_page_overflow.md`.
7. Không thay đổi dữ liệu CV không liên quan hoặc UI dashboard.

## Giả định cần giữ khi triển khai

- “now” được hiển thị đúng như yêu cầu, không đổi thành “Hiện tại”, trừ khi sản phẩm yêu cầu bản dịch tiếng Việt sau này.
- Không tự suy đoán ngày dự án từ GitHub; dự án scrape từ GitHub để trống ngày cho đến khi người dùng nhập.
- GitHub/LinkedIn chỉ được hiển thị trong header khi profile có trường dữ liệu thực tế; nếu muốn hỗ trợ chính thức, cần bổ sung các trường profile và form riêng trong một nhiệm vụ tiếp theo.
- Mục tiêu là bố cục tham chiếu, không sao chép logo, nhãn, dữ liệu hay nhận diện của IIIT Vadodara.
