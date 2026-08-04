# Phân tích lỗi cắt nội dung khi xuất CV PDF

## Hiện trạng

PDF CV có thể mất, đè hoặc chèn nội dung tại mép dưới trang 1 khi CV dài hơn một trang A4. Dự án hiện có hai luồng xuất PDF:

- API AI Service dùng **WeasyPrint** và các template `modern.html`, `classic.html`.
- Frontend dùng **html2pdf.js** làm phương án dự phòng khi API xuất PDF thất bại.

Mọi thay đổi cần áp dụng nhất quán cho luồng đang được sử dụng thực tế; nếu chỉ sửa một luồng, lỗi vẫn có thể xuất hiện ở luồng còn lại.

## Nguyên nhân đã xác định

### 1. Vùng in không có lề an toàn

Hai template của AI Service đang khai báo `@page` với `margin: 0`. Template modern còn dùng `.page` có `min-height: 297mm`; template classic dùng `.page` có `min-height: 297mm` và padding riêng.

Khi phần tử có chiều cao tối thiểu bằng đúng chiều cao trang trong khi nội dung, padding và vùng renderer cần thêm không gian, phần cuối dễ vượt qua vùng có thể in. Đây là điều kiện dẫn đến cắt chữ tại ranh giới trang.

### 2. Wrapper toàn trang dùng Flexbox

Template modern dùng `.page { display: flex; ... }` để tạo sidebar và phần nội dung chính. Các PDF renderer không xử lý việc phân trang trên một flex container lớn ổn định như luồng block thông thường, đặc biệt khi một cột dài hơn chiều cao trang.

### 3. Chống ngắt trang ở khối quá lớn

Template classic đặt `page-break-inside: avoid` cho `.section`, trong khi một section có thể chứa toàn bộ bảng điểm, tất cả dự án hoặc toàn bộ kinh nghiệm. Khi section không vừa cuối trang, renderer có thể dồn cả khối, tạo khoảng trống lớn hoặc gây hành vi cắt/đè tùy engine.

Frontend cũng có `.cv-pdf-section` đặt `break-inside: avoid` và `page-break-inside: avoid`, dù section có thể chứa nhiều item.

### 4. Bảng điểm chưa có quy tắc phân trang theo dòng

`.grade-table` trong hai template chưa khai báo cho phép bảng ngắt tự nhiên, chưa ngăn cắt giữa một dòng, và chưa đặt header lặp lại. Một bảng điểm dài vì vậy không có hợp đồng CSS rõ ràng khi vượt trang.

### 5. Fallback html2pdf.js ưu tiên tránh ngắt mọi phần tử

Cấu hình fallback dùng `pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }`. `avoid-all` cố gắng giữ mọi phần tử trên cùng một trang, xung đột với yêu cầu để nội dung dài tự chảy sang trang sau. html2pdf.js còn render HTML thành canvas trước khi ghép PDF, nên khả năng phân trang ngữ nghĩa kém ổn định hơn WeasyPrint.

### 6. Preview A4 cố định không được dùng làm layout xuất PDF

CSS preview có `.cv-a4-sheet { height: 297mm; overflow: hidden; }`. Quy tắc này hợp lý cho khung xem trước từng trang, nhưng không được dùng cho DOM xuất PDF. Nếu phần tử xuất PDF kế thừa hay bị đặt các giới hạn tương tự, nội dung tràn sẽ bị che thay vì được phân trang.

## Hướng sửa đề xuất

### Thiết lập vùng in chuẩn

Trong stylesheet dành cho PDF/print của cả template, dùng thống nhất:

```css
@page {
  size: A4;
  margin: 12mm 12mm 15mm 12mm;
}

html,
body {
  height: auto;
  margin: 0;
  padding: 0;
}
```

Không dùng `height: 100%`, `height: 100vh`, `min-height`/`max-height` nhằm giới hạn chiều cao trang, hoặc `overflow: hidden` trên `html`, `body`, wrapper PDF, `.container`, `.cv-wrapper` hoặc `.page` dùng để xuất PDF.

Không đặt wrapper PDF ở `width: 210mm` kèm chiều cao cố định. `@page` là nguồn xác định khổ giấy và lề; nội dung chỉ cần có chiều cao tự nhiên (`height: auto`).

### Chuyển layout PDF chính sang luồng block

- Với classic: `.page` cần là block container có chiều cao tự nhiên; giữ padding trong vùng nội dung hoặc điều chỉnh để không nhân đôi lề `@page`.
- Với modern: không dùng Flexbox cho wrapper toàn trang. Cần dùng cấu trúc block có thể phân trang, hoặc thiết kế lại bố cục thành header/thông tin liên hệ và nội dung theo một cột cho bản PDF dài.
- Flexbox chỉ nên giới hạn ở các thành phần nhỏ như dòng tiêu đề công việc và thời gian, nơi chiều cao của item không vượt một trang.
- CSS preview trên màn hình được tách riêng khỏi CSS export/print; `height: 297mm` và `overflow: hidden` chỉ tồn tại trong preview, không áp vào phần tử PDF.

### Quy tắc bảng điểm

Không bọc toàn bộ bảng trong wrapper có `page-break-inside: avoid`. Áp dụng cho mọi bảng điểm:

```css
table {
  page-break-inside: auto;
  break-inside: auto;
}

tr {
  page-break-inside: avoid;
  break-inside: avoid;
  page-break-after: auto;
  break-after: auto;
}

thead {
  display: table-header-group;
}

tfoot {
  display: table-footer-group;
}
```

Nhờ đó, bảng được tách giữa các hàng, không cắt đôi một hàng, và tiêu đề cột được lặp ở đầu trang sau.

### Quy tắc section, dự án và kinh nghiệm

- Bỏ `page-break-inside: avoid` và `break-inside: avoid` khỏi `.section`, `.cv-pdf-section` hoặc mọi wrapper chứa danh sách dài.
- Chỉ đặt hai thuộc tính này lên item nhỏ và độc lập: `.project-item`, `.exp-item`, từng dòng/chip cần giữ nguyên vẹn.
- Giữ `page-break-after: avoid`/`break-after: avoid` cho tiêu đề section để tiêu đề không đứng một mình ở cuối trang. Nếu renderer hỗ trợ, đặt thêm `page-break-after: avoid` cho title và để item đầu tiên chảy theo nó.
- Một item đơn lẻ cao hơn vùng in phải được phép tự tách thay vì bị cưỡng ép `avoid`; nội dung văn bản dài cần có quy tắc ngoại lệ hoặc giới hạn nội dung hợp lý.

### Điều chỉnh luồng fallback html2pdf.js

- Bỏ `avoid-all` khỏi cấu hình `pagebreak`.
- Ưu tiên chế độ CSS để các quy tắc `break-*` và `page-break-*` quyết định vị trí ngắt.
- Bảo đảm phần tử nguồn export là wrapper có `height: auto`, không phải sheet preview cố định 297mm và không có `overflow: hidden`.
- Xem WeasyPrint là luồng xuất PDF ưu tiên cho CV nhiều trang. html2pdf.js là fallback có giới hạn do raster hóa canvas; cần kiểm thử riêng luồng này với nội dung dài.

## Trình tự triển khai an toàn

1. Tách CSS dành cho PDF/print khỏi CSS preview của frontend để không kế thừa kích thước A4 cố định hoặc overflow ẩn.
2. Chuẩn hóa `@page`, `html`, `body` và wrapper xuất PDF trong cả hai template WeasyPrint.
3. Bỏ Flexbox trên wrapper toàn trang của modern; bỏ chống ngắt ở section lớn của classic và frontend print DOM.
4. Thêm quy tắc phân trang bảng cho mọi bảng điểm.
5. Giới hạn `break-inside: avoid` vào từng project/experience item nhỏ.
6. Chỉnh cấu hình html2pdf.js fallback để không dùng `avoid-all`.
7. Kiểm thử bằng nội dung buộc phải vượt một, hai và nhiều trang A4.

## Checklist nghiệm thu

- CV ngắn vẫn giữ đúng bố cục một trang khi đủ chỗ.
- CV dài tạo trang 2 (và các trang tiếp theo) thay vì cắt nội dung ở trang 1.
- Không có chữ bị che, đè, hoặc mất tại mép dưới/đầu trang.
- Bảng điểm dài ngắt giữa các hàng, không cắt giữa một hàng, và lặp header ở trang sau.
- Section dự án và kinh nghiệm được phép trải qua nhiều trang; từng item nhỏ không bị tách nếu item đó vừa một trang.
- Tiêu đề section không bị tách rời khỏi nội dung ngay sau nó.
- Cả WeasyPrint và fallback html2pdf.js đều được kiểm thử với cùng một bộ dữ liệu CV dài.
- Bản xem trước nhiều trang không làm thay đổi DOM hoặc CSS của đối tượng dùng để xuất PDF.

## Kết luận

Giải pháp cốt lõi là để renderer quản lý phân trang dựa trên `@page` có lề an toàn và luồng block có chiều cao tự nhiên. Không khóa chiều cao wrapper PDF, không che overflow, không chống ngắt ở các container lớn, và chỉ chống ngắt ở từng item nhỏ. Các nguyên tắc này giúp nội dung dư tự động chảy sang trang tiếp theo mà không mất hoặc chồng chữ.
