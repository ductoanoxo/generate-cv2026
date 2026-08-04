# 🤖 Agent Prompt: Redesign CV Preview — Harshibar Resume Style + Flexible Viewer

## Context

Bạn đang làm việc trên project **Generate CV 2026** — một ứng dụng tạo CV tự động cho sinh viên.

**Tech Stack Frontend**: React + TypeScript + Vite, vanilla CSS (file `index.css`).

**Vấn đề hiện tại**: Phần CV Preview (tờ A4 xem trước bên phải giao diện CVBuilder) đang có nhiều vấn đề:
- Không có zoom in/out, người dùng không thể phóng to thu nhỏ xem CV
- Layout bị chia 2 cột ở một số section (Skills & Languages)
- Font chữ quá to, quá đậm, spacing quá rộng
- Dự án hiển thị dạng card grid 2 cột thay vì danh sách dọc
- Màu xanh lá (#22C55E) xuất hiện trên tờ CV — không chuyên nghiệp
- Section heading format không đúng chuẩn CV chuyên nghiệp

**Mục tiêu**: Redesign lại CV Preview theo đúng phong cách **Harshibar Resume Template** trên Overleaf (https://www.overleaf.com/latex/templates/harshibars-resume/sbcyynmtpnyd) — minimalist, single-column, ATS-friendly, đen trắng, compact. Đồng thời thêm tính năng zoom/scroll flexible cho viewer.

---

## Đặc Tả Mẫu Harshibar Resume Template

Template Harshibar có các đặc điểm sau mà bạn PHẢI tuân theo:

1. **Header centered**: Tên lớn nhất (~20-22px), centered. Contact info trên 1 dòng centered phân tách bằng `·` hoặc `|` (email · phone · address)
2. **Single column layout**: Tất cả sections xếp dọc 1 cột, KHÔNG chia 2 cột
3. **Section headings**: Chữ in hoa (UPPERCASE), font nhỏ (~11-12px), bold, letter-spacing rộng, đường kẻ ngang đậm phía dưới (`border-bottom: 1.5px solid #000`)
4. **Typography compact**: Body text ~10px, bullet text ~9-10px, line-height ~1.3-1.4
5. **Màu đen trắng**: Chỉ dùng đen (#000), xám đậm (#333), xám nhạt (#666). KHÔNG dùng màu xanh lá, xanh dương hay bất kỳ màu nào khác trên tờ CV
6. **Projects**: Hiển thị flat (không card/border), tiêu đề bold + technologies italic cùng dòng, mô tả dạng bullet points `•`
7. **Spacing compact**: Padding tờ A4 ~10-12mm, gap giữa sections ~6-8px, không có khoảng trống lớn
8. **Font family**: Dùng `'Lato', 'Helvetica Neue', Arial, sans-serif` (gần giống LaTeX output)

---

## Files Cần Sửa

### File 1: `frontend/src/index.css`
**Đường dẫn đầy đủ**: `D:\CaoDangTayDo_Intern\generate_cv\generate-cv2026\frontend\src\index.css`

Chứa toàn bộ CSS classes cho CV Preview. Các classes cần viết lại:
- `.cv-preview` (line ~686) — container viewer
- `.cv-a4-sheet` (line ~703) — tờ A4
- `.cv-pdf-header` (line ~736) — header CV
- `.cv-pdf-name` (line ~744) — tên sinh viên
- `.cv-pdf-contact` (line ~750) — thông tin liên hệ
- `.cv-pdf-section` (line ~757) — mỗi section
- `.cv-pdf-section-title` (line ~763) — tiêu đề section
- `.cv-pdf-grid` (line ~772) — grid dự án
- `.cv-pdf-project-card` (line ~778) — card dự án
- `.cv-pdf-project-title` (line ~785) — tiêu đề dự án
- `.cv-pdf-project-tech` (line ~790) — công nghệ dự án
- `.cv-tag` (line ~812) — tag kỹ năng
- `.cv-grade-grid` (line ~727) — grid điểm
- `.cv-grade-item` (line ~728) — item điểm
- `@media print` (line ~862-932) — stylesheet in ấn

Thêm mới:
- `.cv-viewer-toolbar` — thanh công cụ zoom
- `.cv-viewer-container` — container scrollable với background xám

### File 2: `frontend/src/pages/student/CVBuilder.tsx`
**Đường dẫn đầy đủ**: `D:\CaoDangTayDo_Intern\generate_cv\generate-cv2026\frontend\src\pages\student\CVBuilder.tsx`

Chứa phần CV Live Preview (tờ A4 trong CVBuilder) từ dòng ~1123 đến ~1259. Cần sửa:
- Thêm zoom state + toolbar UI (nút +/- zoom, fit-to-page, % hiển thị)
- Wrap `.cv-a4-sheet` trong container scrollable + transform scale
- Sửa header thành centered (hiện tại là `justify-content: space-between`)
- Bỏ `gridTemplateColumns: '2fr 1fr'` ở Skills & Languages (dòng ~1148)
- Sửa Projects từ `.cv-pdf-grid` 2 cột thành danh sách dọc flat
- Bỏ tất cả inline styles dùng `color: '#22C55E'` trên tờ A4

### File 3: `frontend/src/components/CVPreview.tsx`
**Đường dẫn đầy đủ**: `D:\CaoDangTayDo_Intern\generate_cv\generate-cv2026\frontend\src\components\CVPreview.tsx`

Chứa component CVPreview fallback (khi không có children). Cần đồng bộ layout với CVBuilder.tsx:
- Header centered
- Single column
- Flat project style
- Đen trắng

---

## Nhiệm Vụ Cụ Thể

### Nhiệm vụ 1: Viết lại CSS — `index.css`

**MỤC TIÊU**: Cập nhật toàn bộ `.cv-*` classes + thêm classes mới cho viewer.

**Yêu cầu CSS mới**:

```css
/* Thêm Google Font Lato vào đầu file (dưới các @import hiện có) */
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap');

/* ── Flexible CV Viewer ── */
.cv-viewer-toolbar {
  /* Thanh công cụ: nút zoom +/-, fit, % label */
  /* Background tối, flex row, gap, padding nhỏ, border-radius */
  /* Vị trí sticky top trong panel bên phải */
}

.cv-viewer-container {
  /* Container scroll: background #525659 (xám đậm giống Overleaf) */
  /* overflow: auto, display flex, justify-content center */
  /* padding để tờ A4 có khoảng trống xung quanh */
}

/* ── Tờ A4 ── */
.cv-a4-sheet {
  /* width: 210mm, min-height: 297mm */
  /* padding: 10mm 12mm (compact hơn hiện tại 16mm) */
  /* font-family: 'Lato', sans-serif, font-size: 10px */
  /* color: #1a1a1a, background: #fff */
  /* transform-origin: top center (cho zoom) */
  /* transition: transform 0.2s ease */
}

/* ── Header centered ── */
.cv-pdf-header {
  /* text-align: center, border-bottom: 1.5px solid #000 */
  /* padding-bottom: 6px, margin-bottom: 8px */
  /* BỎ display:flex, BỎ justify-content: space-between */
}

.cv-pdf-name {
  /* font-size: 1.375rem (~22px), font-weight: 900 */
  /* color: #000, margin-bottom: 2px */
}

.cv-pdf-contact {
  /* font-size: 0.5625rem (~9px), color: #333 */
  /* display: inline (1 dòng), text-align: center */
}

/* ── Section Title ── */
.cv-pdf-section-title {
  /* font-size: 0.6875rem (~11px), font-weight: 700 */
  /* text-transform: uppercase, letter-spacing: 1.5px */
  /* color: #000, border-bottom: 1.5px solid #000 */
  /* padding-bottom: 1px, margin-bottom: 3px */
}

/* ── Projects flat style ── */
/* BỎ .cv-pdf-grid 2 cột, BỎ .cv-pdf-project-card borders/background */
/* Chuyển thành danh sách dọc, project title bold + tech italic cùng dòng */

/* ── Đen trắng toàn bộ ── */
/* BỎ hết #22C55E trên CV (chỉ giữ ở form input bên trái) */
```

**LƯU Ý QUAN TRỌNG**: 
- KHÔNG sửa các CSS classes của form input bên trái (`.input-field`, `.btn-icon-text`, `.tag`, `.tag-list`, etc.)
- Chỉ sửa CSS liên quan đến tờ CV Preview (`.cv-preview`, `.cv-a4-sheet`, `.cv-pdf-*`, `.cv-tag`, `.cv-grade-*`)
- Giữ nguyên `@media print` nhưng cập nhật cho phù hợp format mới

---

### Nhiệm vụ 2: Thêm Zoom Viewer — `CVBuilder.tsx`

**MỤC TIÊU**: Thêm thanh công cụ zoom và container scrollable.

**Yêu cầu**:
1. Thêm state: `const [zoomLevel, setZoomLevel] = useState(0.7);` (mặc định 70% để fit tốt)
2. Thêm toolbar UI phía trên tờ A4 với:
   - Nút `−` giảm zoom 10% (min 30%)
   - Nút `+` tăng zoom 10% (max 150%)
   - Nút `Fit` reset về auto-fit
   - Label hiển thị `{Math.round(zoomLevel * 100)}%`
3. Wrap tờ A4 trong container `.cv-viewer-container`:
   ```tsx
   <div className="cv-viewer-container" style={{ overflow: 'auto' }}>
     <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}>
       <div id="printable-cv" className="cv-a4-sheet">
         {/* ... nội dung CV ... */}
       </div>
     </div>
   </div>
   ```
4. Container phải cho phép scroll cả X và Y khi zoom to

**LƯU Ý**: Zoom KHÔNG ảnh hưởng đến export PDF — khi export vẫn dùng scale gốc.

---

### Nhiệm vụ 3: Sửa Layout A4 Sheet — `CVBuilder.tsx`

**MỤC TIÊU**: Redesign nội dung tờ A4 theo Harshibar style.

**Yêu cầu sửa trong phần `{/* CV Live Preview Column */}` (dòng ~1123-1259)**:

1. **Header centered**:
   ```tsx
   <div className="cv-pdf-header">
     <div className="cv-pdf-name">{cvData.profile.fullName}</div>
     <div className="cv-pdf-contact">
       {cvData.profile.email} · {cvData.profile.phoneNumber} · {cvData.profile.hometown}
     </div>
   </div>
   ```

2. **Bỏ grid 2 cột Skills & Languages** (dòng ~1148): Chuyển thành single column

3. **Thứ tự sections mới**:
   - Header (centered)
   - EDUCATION (trường, ngành, GPA)
   - SUMMARY (giới thiệu bản thân — ngắn gọn)
   - EXPERIENCE (kinh nghiệm thực tập — nếu có)
   - PROJECTS (dự án — flat list, bullet points)
   - TECHNICAL SKILLS / COMPETENCES (gom nhóm kỹ năng)
   - LANGUAGES (ngoại ngữ)
   - CERTIFICATIONS (chứng chỉ — nếu có)
   - RELEVANT COURSEWORK (điểm môn học)
   - ACTIVITIES (hoạt động ngoại khóa)

4. **Projects flat style**:
   ```tsx
   <div className="cv-pdf-section">
     <div className="cv-pdf-section-title">Projects</div>
     {cvData.projects.map((proj, idx) => (
       <div key={idx} className="cv-pdf-project-item">
         <div className="cv-pdf-project-header">
           <span className="cv-pdf-project-name">{proj.name}</span>
           <span className="cv-pdf-project-tech-inline">
             {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
           </span>
         </div>
         <div className="cv-pdf-project-role">{proj.role}</div>
         <div className="cv-pdf-project-desc">• {proj.description}</div>
       </div>
     ))}
   </div>
   ```

5. **Bỏ tất cả inline `color: '#22C55E'`** trong phần A4 sheet (chỉ giữ ở form bên trái)

---

### Nhiệm vụ 4: Đồng bộ CVPreview.tsx

**MỤC TIÊU**: Cập nhật component fallback cho khớp với layout mới.

**Yêu cầu**: Áp dụng cùng thay đổi layout/structure như CVBuilder.tsx:
- Header centered
- Single column
- Flat projects
- Đen trắng
- Giữ nguyên function `getFormattedSkillGroups` (export) — KHÔNG sửa logic

---

### Nhiệm vụ 5: Cập nhật Print Stylesheet

**MỤC TIÊU**: Đảm bảo `@media print` trong `index.css` hoạt động đúng với format mới.

**Yêu cầu**:
- Ẩn toolbar zoom khi in
- Tờ A4 full width, không transform scale
- Giữ format đen trắng (đã đúng)
- Font size giữ nguyên compact

---

## Quy Tắc Bắt Buộc

1. **KHÔNG sửa bất kỳ file backend nào** (ai-service, backend .NET)
2. **KHÔNG sửa logic data flow** — `categorizedSkills`, `getFormattedSkillGroups`, handlers `handleAddItemToCategory`, etc. phải giữ nguyên
3. **KHÔNG sửa form input bên trái** — chỉ sửa phần CV Preview (tờ A4 bên phải)
4. **KHÔNG thêm thư viện mới** ngoài Google Fonts
5. **Chạy `npx tsc --noEmit`** sau mỗi thay đổi TypeScript để verify
6. **Giữ nguyên `id="printable-cv"`** trên tờ A4 vì export PDF phụ thuộc vào nó

---

## Acceptance Criteria

- [ ] Tờ CV hiển thị **đen trắng**, **single column**, **compact** giống Harshibar template
- [ ] Header **centered** với tên to nhất, contact 1 dòng phân tách bằng `·`
- [ ] Section titles **UPPERCASE** với đường kẻ ngang đậm
- [ ] Projects hiển thị **flat** (không card, không grid 2 cột)
- [ ] Viewer có **toolbar zoom** (+/- / fit / %) hoạt động mượt
- [ ] Viewer có **scroll** cả X và Y khi zoom to
- [ ] Background viewer **xám đậm** giống Overleaf
- [ ] **Export PDF** vẫn hoạt động đúng format mới
- [ ] **TypeScript compile** thành công (`npx tsc --noEmit` exit code 0)
- [ ] **Không break** form input bên trái (Section 1-8 + COMPETENCES editor)
