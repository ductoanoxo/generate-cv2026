# Prompt cho agent: triển khai bố cục CV tham chiếu Overleaf

```text
Bạn là kỹ sư full-stack chuyên React/TypeScript, Jinja/WeasyPrint và PDF layout. Hãy triển khai toàn bộ nhiệm vụ trong tài liệu nguồn:

docs/analysis_cv_overleaf_layout.md

Đọc hết tài liệu trên, đồng thời đọc `docs/analysis_pdf_page_overflow.md`, trước khi thay đổi mã nguồn.

## Mục tiêu

Đưa CV về bố cục một cột theo tinh thần mẫu IIIT Vadodara Resume:

- Thông tin cá nhân ở đầu trang theo các hàng trái-phải.
- Có mục `Education` ngay sau phần đầu trang.
- Mỗi project có tên in đậm bên trái, thời gian bên phải, công nghệ/kỹ năng ở dòng dưới, tiếp theo là vai trò/mô tả khi có.
- Thời gian project hiển thị chính xác theo `MM/YYYY - MM/YYYY` hoặc `MM/YYYY - now`.
- Preview frontend và PDF WeasyPrint có cùng thông tin và thứ tự nội dung cốt lõi.
- CV nhiều trang không bị cắt, che hoặc chồng chữ.

Không sao chép thương hiệu, logo, nội dung hoặc dữ liệu của mẫu IIIT Vadodara; chỉ tham chiếu cấu trúc bố cục.

## Phạm vi triển khai

Kiểm tra và cập nhật các file sau khi cần thiết:

- `frontend/src/mock/mockData.ts`
- `frontend/src/components/ProjectForm.tsx`
- `frontend/src/components/CVPreview.tsx`
- `frontend/src/pages/student/CVBuilder.tsx`
- `frontend/src/index.css`
- `ai-service/app/models/schemas.py`
- `ai-service/app/templates/modern.html`
- `ai-service/app/templates/classic.html`

Tìm thêm các vị trí mapping/lưu CV/AI pipeline có liên quan trực tiếp đến `projects`; cập nhật chúng nếu nếu không sẽ làm mất dữ liệu ngày dự án. Không thay đổi dashboard, schema database, API không liên quan, hay các chức năng CV ngoài phạm vi.

## Yêu cầu dữ liệu và form

1. Bổ sung cho project hai trường optional:

   ```ts
   startDate?: string; // YYYY-MM
   endDate?: string;   // YYYY-MM; rỗng hoặc undefined nghĩa là đang thực hiện
   ```

2. Đồng bộ trường này ở tất cả type/schema/payload frontend và AI service; dự án cũ không có hai trường này phải tiếp tục hoạt động.

3. Trong `ProjectForm`, thêm input `type="month"` cho ngày bắt đầu và ngày kết thúc. Ngày kết thúc phải cho phép bỏ trống. Không lưu giá trị hiển thị đã format vào dữ liệu.

4. Dự án từ GitHub không được tự đoán ngày; giữ hai trường trống cho đến khi người dùng nhập.

5. Tạo một helper dùng chung hoặc logic tập trung để format thời gian:

   - `2024-08` + `2026-07` → `08/2024 - 07/2026`
   - `2025-07` + rỗng → `07/2025 - now`
   - không có `startDate` → không render vùng thời gian

   Helper phải xử lý dữ liệu invalid an toàn, không throw lỗi và không render chuỗi `undefined`/`Invalid Date`.

## Yêu cầu layout

### Header

- Render theo các hàng hai cột nhỏ (không phải flex/grid cho outer PDF document):
  - Họ tên in hoa/đậm ở trái; điện thoại ở phải.
  - Mã sinh viên ở trái; email ở phải.
  - Ngành ở trái; email trường ở phải nếu có dữ liệu riêng, nếu không dùng email hiện có một lần hợp lý.
  - Khoa/chuyên ngành ở trái; GitHub/LinkedIn ở phải chỉ khi profile đã có dữ liệu thật.
  - `Trường Cao đẳng Tây Đô` ở trái.
- Các giá trị rỗng không tạo dòng trống hoặc placeholder.
- Dữ liệu dài phải wrap tự nhiên và không chồng lên cột đối diện.

### Education

- Thêm section `Education` sau header, trước Projects/Experience.
- Phiên bản hiện tại có một education item:
  - Trái, đậm: `Trường Cao đẳng Tây Đô`.
  - Phải: `academicYear`; ưu tiên format thành khoảng năm nếu dữ liệu đã có thể chuẩn hóa, nếu không hiển thị nguyên giá trị.
  - Dòng dưới trái: `major`, kèm `faculty` khi có.
  - Dòng dưới phải: `GPA: {gpa}` chỉ khi `gpa > 0`.
- Không tạo mới `education[]` hay dữ liệu học vấn giả trong nhiệm vụ này.

### Projects

- Mỗi project là một item độc lập, không dùng card màu.
- Hàng 1: bullet + tên project in đậm trái; khoảng thời gian phải.
- Hàng 2: `Skills:` hoặc `Tools & technologies used:` và `technologies.join(', ')`.
- Hàng tiếp theo: vai trò và mô tả/đóng góp chỉ khi có dữ liệu.
- Tên project dài được phép wrap, nhưng thời gian không bị che/cắt/tràn.

## Quy tắc PDF bắt buộc

Tuân thủ toàn bộ `docs/analysis_pdf_page_overflow.md`, đặc biệt:

- `@page { size: A4; margin: 12mm 12mm 15mm 12mm; }` cho CSS PDF/print.
- `body { height: auto; margin: 0; padding: 0; }`.
- Không dùng fixed height, `min-height`/`max-height` nhằm khóa tài liệu PDF, hoặc `overflow: hidden` trên outer wrapper export.
- Không dùng `display: flex`/`grid` cho outer wrapper của toàn bộ tài liệu PDF. Flex/grid chỉ chấp nhận ở thành phần nhỏ nếu không ảnh hưởng phân trang.
- Section lớn (`Education`, `Projects`, `Experience`) phải được phép ngắt trang tự nhiên.
- Chỉ áp dụng `break-inside: avoid`/`page-break-inside: avoid` cho một item nhỏ nếu item đó vừa một trang; không áp dụng cho cả section.
- Nếu template có bảng điểm, giữ nguyên hoặc bổ sung các quy tắc phân trang bảng đã nêu trong tài liệu overflow.
- CSS preview A4 cố định chỉ áp dụng preview; tuyệt đối không rò sang DOM export PDF.
- html2pdf.js fallback không được dùng `avoid-all`; ưu tiên phân trang theo CSS.

## Đồng bộ renderer

- Triển khai bố cục mới ở `CVPreview.tsx` và stylesheet print/export frontend.
- Triển khai cùng thứ tự/dữ liệu tại `modern.html` và `classic.html` cho WeasyPrint.
- Không thay đổi layout DOCX trừ khi sau khi kiểm tra có yêu cầu/luồng bắt buộc phải đồng bộ; nếu không sửa DOCX, ghi rõ giới hạn này trong báo cáo.

## Kiểm tra bắt buộc

1. Chạy type-check/lint/build phù hợp với phần frontend đã sửa, nếu môi trường hỗ trợ.
2. Chạy test hoặc tạo dữ liệu mẫu kiểm tra cho schema PDF nếu môi trường hỗ trợ.
3. Xác minh bằng dữ liệu có:
   - Project `2024-08` đến `2026-07`.
   - Project `2025-07` không có ngày kết thúc.
   - Project cũ không có ngày.
   - Tên project dài, technologies dài và nhiều project để ép CV vượt trang.
   - GPA có và GPA bằng 0.
4. Nếu không thể render PDF trong môi trường, nêu chính xác lý do và thực hiện các kiểm tra tĩnh khả dụng.

## Bàn giao

Trong phản hồi cuối, nêu ngắn gọn:

1. Các file đã thay đổi và mục đích.
2. Cách dữ liệu ngày project được lưu, truyền và format.
3. Cách header, Education và Projects đáp ứng yêu cầu layout.
4. Các lệnh kiểm tra đã chạy cùng kết quả, hoặc lý do không thể chạy.
5. Những giới hạn còn lại (nếu có), đặc biệt liên quan đến html2pdf.js hoặc DOCX.
```
