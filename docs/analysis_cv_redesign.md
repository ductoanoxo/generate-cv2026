# 📋 Phân Tích & Kế Hoạch: Redesign CV Preview theo Harshibar Resume Template

## 🎯 Mục Tiêu

Thiết kế lại phần CV Preview (tờ A4 bên phải) trong CVBuilder để:
1. **Flexible viewer** — zoom in/out, cuộn mượt, giống trình xem PDF trên Overleaf
2. **Format CV chuẩn chuyên nghiệp** — theo mẫu [Harshibar Resume](https://www.overleaf.com/latex/templates/harshibars-resume/sbcyynmtpnyd.pdf)
3. **Layout 1 cột dọc** — không chia 2 cột như hiện tại
4. **Font nhỏ gọn, compact** — giống LaTeX output (không chữ to, đậm quá mức)

---

## 🔴 Vấn Đề Hiện Tại

### 1. Viewer không flexible
- **File**: [`CVPreview.tsx`](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/frontend/src/components/CVPreview.tsx) + [`CVBuilder.tsx`](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/frontend/src/pages/student/CVBuilder.tsx)
- Hiện tại `.cv-preview` chỉ là `overflow-y: auto` — không có nút zoom in/out
- Không có thanh công cụ viewer (phóng to, thu nhỏ, fit-to-page)
- Tờ A4 bị cố định `width: 210mm` không scale theo viewport

### 2. Layout bị chia 2 cột
- **File**: [`CVBuilder.tsx`](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/frontend/src/pages/student/CVBuilder.tsx#L1147-L1168)
- Dòng 1148: `gridTemplateColumns: '2fr 1fr'` — Skills & Languages đang chia 2 cột
- **Cần sửa**: Chuyển thành layout 1 cột dọc liên tục như template Harshibar

### 3. Font chữ to, đậm không chuẩn LaTeX
- **File**: [`index.css`](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/frontend/src/index.css#L744-L770)
- `.cv-pdf-name` → `font-size: 2rem` (quá to, Harshibar dùng ~18-20pt)
- `.cv-pdf-section-title` → `font-size: 1.15rem` (cần nhỏ hơn, ~10-11pt, viết hoa)
- Body text hiện ~0.85rem (cần ~9-10pt)
- **Cần sửa**: Giảm toàn bộ font về chuẩn LaTeX compact

### 4. Spacing quá rộng, nội dung bị cách
- `.cv-a4-sheet` → `padding: 16mm` (quá rộng, Harshibar dùng ~10-12mm)
- `.cv-pdf-section` → `gap: var(--space-sm)` (quá rộng)
- `gap: 20px` trong `cv-a4-sheet` inline style (quá rộng)
- **Cần sửa**: Giảm padding/margin/gap cho compact như LaTeX

### 5. Dự án hiển thị dạng card grid 2 cột
- `.cv-pdf-grid` → `grid-template-columns: 1fr 1fr` (2 cột)
- `.cv-pdf-project-card` → có border, background, border-radius (card style)
- **Cần sửa**: Bỏ card style, chuyển thành danh sách dọc có bullet points

### 6. Section heading không đúng chuẩn Harshibar
- Hiện tại: chữ to, đậm, `border-bottom: 1px solid #E2E8F0`
- **Cần sửa**: Chữ nhỏ hơn, UPPERCASE, đường kẻ ngang đậm hơn (như horizontal rule trong LaTeX)

---

## ✅ Giải Pháp Chi Tiết

### Phần A: Flexible CV Viewer (Zoom/Scroll)

#### A1. Thêm thanh công cụ Viewer
- **File cần sửa**: `CVBuilder.tsx`
- Thêm một toolbar phía trên tờ A4 với các nút:
  - 🔍+ Zoom In (tăng scale 10%)
  - 🔍- Zoom Out (giảm scale 10%)  
  - 📐 Fit to Page (reset về 100%)
  - 📄 Hiển thị % zoom hiện tại
- Sử dụng React state `zoomLevel` (mặc định 0.75 hoặc auto-fit)
- Apply CSS `transform: scale(zoomLevel)` lên `.cv-a4-sheet`

#### A2. Container scrollable cho tờ A4
- **File cần sửa**: `index.css`
- `.cv-preview` wrapper:
  - `overflow: auto` (scroll cả X và Y khi zoom to)
  - Background xám giống Overleaf (`#525659`)
  - Centering tờ A4 trong container
- `.cv-a4-sheet`:
  - `transform-origin: top center`
  - `transition: transform 0.2s ease`
  - Thêm shadow giống trang giấy thực

### Phần B: Format CV theo Harshibar Template

#### B1. Cập nhật Font & Typography
- **File cần sửa**: `index.css`
- Import Google Font: `Lato` hoặ `CMU Serif` (gần giống LaTeX Computer Modern)
- Bảng font size mới:

| Element | Hiện tại | Mới (Harshibar) |
|---|---|---|
| `.cv-pdf-name` (Tên) | 2rem (32px) | 1.375rem (22px), bold |
| `.cv-pdf-section-title` | 1.15rem (18px) | 0.75rem (12px), UPPERCASE, letter-spacing |
| Body text | 0.85rem (13.6px) | 0.625rem (10px) |
| Contact info | 0.85rem | 0.5625rem (9px) |
| Project title | inherit (to) | 0.625rem (10px), bold |
| Bullet text | 0.75rem | 0.5625rem (9px) |

#### B2. Cập nhật Layout — Single Column
- **File cần sửa**: `CVBuilder.tsx` dòng 1147-1168
- Bỏ `gridTemplateColumns: '2fr 1fr'`
- Chuyển thành `flexDirection: 'column'`
- Thứ tự sections (theo Harshibar):
  1. **Header** — Tên trung tâm, contact info trên 1 dòng (email | phone | address)
  2. **EDUCATION** — Trường, ngành, GPA
  3. **EXPERIENCE** — Kinh nghiệm thực tập
  4. **PROJECTS** — Dự án (bullet points, không card)
  5. **TECHNICAL SKILLS** — Competences (giữ nguyên format gom nhóm)
  6. **CERTIFICATIONS** — Chứng chỉ
  7. **ACTIVITIES** — Hoạt động ngoại khóa

#### B3. Header — Centered như Harshibar
- **File cần sửa**: `CVBuilder.tsx` + `CVPreview.tsx` + `index.css`
- Tên: **centered, bold, font lớn nhất** (~22px)
- Contact info: **1 dòng centered**, phân tách bằng `|` hoặc `·`
  - Ví dụ: `email@example.com · 0912-345-678 · TP. Cần Thơ`
- Bỏ layout `justify-content: space-between` hiện tại
- Bỏ `border-bottom: 2px solid #22C55E`, thay bằng `border-bottom: 1.5px solid #000`

#### B4. Section Title — Horizontal Rule Style
- **File cần sửa**: `index.css`
- Format mới:
  ```css
  .cv-pdf-section-title {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #000;
    border-bottom: 1.5px solid #000;
    padding-bottom: 2px;
    margin-bottom: 4px;
  }
  ```

#### B5. Projects — Bullet Style thay vì Card
- **File cần sửa**: `CVBuilder.tsx` + `CVPreview.tsx`
- Bỏ `.cv-pdf-grid` (2 cột) → danh sách dọc
- Bỏ `.cv-pdf-project-card` (border, background) → flat
- Format mới:
  ```
  Project Name | Technologies Used                    Date
    • Bullet point mô tả chức năng 1
    • Bullet point mô tả chức năng 2
  ```

#### B6. Spacing & Padding Compact
- **File cần sửa**: `index.css`
- `.cv-a4-sheet`: `padding: 10mm 12mm` (giảm từ 16mm)
- `.cv-pdf-section`: `gap: 2px` (giảm từ `var(--space-sm)`)
- Container gap: `8px` (giảm từ `20px`)
- Dùng `line-height: 1.3` thay vì `1.5`

#### B7. Màu sắc — Đen trắng chuẩn chuyên nghiệp
- **File cần sửa**: `index.css`
- Bỏ màu `#22C55E` (xanh lá) khỏi CV Preview
- Section title: `color: #000000`
- Body text: `color: #1a1a1a`
- Contact: `color: #333333`
- Border: `#000000` (đường kẻ section), không dùng `#E2E8F0` nhạt

---

## 📁 Danh Sách File Cần Sửa

| File | Thay đổi |
|---|---|
| `frontend/src/index.css` | Viết lại toàn bộ CSS `.cv-*` classes |
| `frontend/src/components/CVPreview.tsx` | Cập nhật JSX: centered header, single column, flat style |
| `frontend/src/pages/student/CVBuilder.tsx` | Thêm zoom toolbar, sửa A4 sheet layout, bỏ 2-column grid |

---

## 🔧 Thứ Tự Thực Hiện

1. **Bước 1**: Sửa `index.css` — Viết lại toàn bộ CSS cho `.cv-preview`, `.cv-a4-sheet`, `.cv-pdf-*` classes theo typography và spacing mới
2. **Bước 2**: Sửa `CVBuilder.tsx` — Thêm zoom state + toolbar, sửa layout A4 sheet sang single column, centered header, flat projects
3. **Bước 3**: Sửa `CVPreview.tsx` — Đồng bộ layout component fallback (khi không dùng children)
4. **Bước 4**: Sửa `@media print` — Đảm bảo print/export PDF vẫn giữ format mới
5. **Bước 5**: Test toàn bộ flow — Zoom in/out, scroll, responsive, export PDF
