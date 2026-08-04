# Prompt cho agent: sửa lỗi phân trang CV PDF

```text
Bạn là kỹ sư frontend/PDF rendering. Hãy thực thi các nhiệm vụ trong tài liệu:

docs/analysis_pdf_page_overflow.md

Mục tiêu bắt buộc: khi CV dài hơn một trang A4, nội dung phải tự chảy sang trang tiếp theo, không bị cắt, che, đè chữ hoặc mất dòng tại ranh giới trang.

## Phạm vi cần kiểm tra và sửa

1. Luồng xuất PDF chính qua WeasyPrint:
   - ai-service/app/templates/modern.html
   - ai-service/app/templates/classic.html
   - ai-service/app/services/export_service.py (chỉ khi thật sự cần thiết để stylesheet/template được áp dụng)

2. Luồng xuất PDF fallback của frontend:
   - frontend/src/pages/student/CVBuilder.tsx
   - frontend/src/components/CVPreview.tsx
   - frontend/src/index.css

Không thay đổi các chức năng CV, schema dữ liệu, API contract, nội dung CV, hoặc giao diện dashboard không liên quan.

## Yêu cầu triển khai bắt buộc

### A. Vùng in và container gốc

- Dùng chính xác quy tắc sau cho stylesheet PDF/print:

  @page {
    size: A4;
    margin: 12mm 12mm 15mm 12mm;
  }

- Thiết lập `body` cho bản in/PDF là `height: auto; margin: 0; padding: 0;`.
- Không dùng `height: 100%`, `height: 100vh`, `max-height`, `min-height` để khóa chiều cao trang, hoặc `overflow: hidden` trên `html`, `body`, wrapper PDF, `.container`, `.cv-wrapper`, `.page`, hay phần tử xuất PDF.
- Không đặt wrapper xuất PDF ở chiều cao cố định 297mm. `@page` quyết định kích thước giấy; phần nội dung phải có `height: auto` để chảy trang tự nhiên.
- CSS của preview A4 trên màn hình có thể giữ chiều cao cố định/overflow ẩn nếu cần hiển thị, nhưng các quy tắc đó tuyệt đối không được áp vào DOM dùng để export hoặc print.

### B. Layout chính

- Không dùng `display: flex` hoặc `display: grid` cho wrapper bao quanh toàn bộ trang/tài liệu PDF.
- Đặc biệt, thay `.page` của template modern khỏi layout Flexbox toàn trang bằng cấu trúc block có thể phân trang ổn định. Có thể vẫn dùng flex cho thành phần nhỏ trong một item (ví dụ dòng công ty và thời gian) nếu không phải outer wrapper.
- Bỏ `page-break-inside: avoid` và `break-inside: avoid` khỏi section lớn chứa danh sách, gồm `.section` và `.cv-pdf-section` khi chúng có thể chứa bảng, nhiều dự án hoặc nhiều kinh nghiệm.

### C. Bảng điểm

- Không bọc toàn bộ `<table>` trong bất cứ container nào có `page-break-inside: avoid`.
- Áp dụng CSS tương đương các quy tắc sau cho bảng điểm:

  table { page-break-inside: auto; break-inside: auto; }
  tr {
    page-break-inside: avoid;
    break-inside: avoid;
    page-break-after: auto;
    break-after: auto;
  }
  thead { display: table-header-group; }
  tfoot { display: table-footer-group; }

- Giữ mỗi hàng nguyên vẹn khi hàng đó vừa trong vùng in và lặp header bảng tại đầu trang tiếp theo.

### D. Section và item nhỏ

- Chỉ dùng `page-break-inside: avoid` / `break-inside: avoid` cho từng `.project-item`, `.exp-item`, hoặc card/dòng nhỏ tương đương.
- Giữ title section đi cùng item đầu tiên bằng `break-after: avoid` / `page-break-after: avoid` ở title nếu renderer hỗ trợ.
- Không áp dụng `avoid` cho item có thể dài hơn một trang. Nội dung văn bản quá dài phải được phép ngắt thay vì tràn/cắt.

### E. Fallback html2pdf.js

- Xóa `avoid-all` khỏi `pagebreak.mode`.
- Ưu tiên `css` để quy tắc CSS break được áp dụng; chỉ giữ các mode khác nếu chứng minh chúng không triệt tiêu natural overflow.
- Đảm bảo phần tử nguồn `#printable-cv` khi export có chiều cao tự nhiên, không bị `overflow: hidden`, không nằm trong wrapper bị khóa chiều cao và không phụ thuộc vào preview A4 cố định.

## Cách thực hiện

1. Đọc toàn bộ `docs/analysis_pdf_page_overflow.md` trước khi sửa.
2. Kiểm tra CSS/DOM thật của các file nêu trên và xác định selector nào đang áp lên phần tử export.
3. Thực hiện thay đổi nhỏ nhất đáp ứng toàn bộ yêu cầu, tránh tái cấu trúc không cần thiết.
4. Không dùng giải pháp ép trang bằng JavaScript, không cắt chuỗi thủ công, không giảm cỡ chữ để che lỗi, và không chèn spacer cố định để đẩy nội dung xuống.
5. Không sửa các file ngoài phạm vi trừ khi có phụ thuộc trực tiếp, cần thiết và được nêu rõ trong báo cáo.

## Kiểm thử và nghiệm thu

- Chạy các kiểm tra/build phù hợp với các file đã sửa, nếu môi trường cho phép.
- Kiểm tra tối thiểu các tình huống: CV một trang; CV nhiều trang; bảng điểm dài; nhiều dự án; nhiều kinh nghiệm; một item sát đáy trang; item mô tả dài.
- Xác nhận kết quả ở cả WeasyPrint và fallback html2pdf.js, hoặc nêu rõ nếu một luồng không thể chạy trong môi trường.
- Đảm bảo không còn selector PDF/export nào vi phạm các điều cấm ở mục A và B.

## Báo cáo bàn giao

Trả về:

1. Danh sách file đã sửa và lý do ngắn gọn.
2. Mapping từng yêu cầu ở trên tới thay đổi cụ thể.
3. Kết quả kiểm thử hoặc lý do không thể chạy kiểm thử.
4. Rủi ro/giới hạn còn lại, đặc biệt giới hạn phân trang của html2pdf.js khi raster hóa canvas.
```
