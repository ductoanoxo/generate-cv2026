# 📊 Phân Tích Kết Quả Ngày 8 (Đức Toàn) & Kế Hoạch Ngày 9 (Minh Hải)

> **Ngày phân tích**: 27/07/2026  
> **Dựa trên**: Git log từ nhánh `main`, file [phan_cong_generate_cv.md](file:///D:/CaoDangTayDo_Intern/generate_cv/generate-cv2026/docs/phan_cong_generate_cv.md)

---

## 📌 Phần 1: Đức Toàn đã làm được gì trong Ngày 8?

### Nhiệm vụ được giao (theo phân công)

> **NGÀY 8**: Export PDF & DOCX Engine + HTML Templates  
> **Mảng**: AI Export & Templates  
> **Mục tiêu**: Xây dựng module xuất file CV định dạng PDF/DOCX chuyên nghiệp.

| # | Nhiệm vụ yêu cầu | Trạng thái |
|---|---|---|
| 1 | Thiết kế 2 template HTML CV (`templates/modern.html`, `templates/classic.html`) | ✅ Hoàn thành |
| 2 | Xây dựng `export_service.py` dùng WeasyPrint (PDF) và python-docx (DOCX) | ✅ Hoàn thành |
| 3 | Tạo router endpoint `GET /api/export/{format}` (pdf/docx) | ✅ Hoàn thành (dùng POST thay vì GET) |

### Chi tiết commits

| Commit | Message | Files changed |
|--------|---------|---------------|
| `c4bd4f0` | Export PDF & DOCX Engine + HTML Templates | 9 files, +997 / -3 lines |
| `77d1cc7` | update | 1 file (fix main.py), +2 / -1 lines |

### Phân tích chi tiết từng file đã tạo/sửa

#### 1. `ai-service/app/services/export_service.py` ✅ Hoàn thiện
- **`generate_pdf(cv_data, template_name)`**: Dùng Jinja2 render dữ liệu CV vào HTML template → WeasyPrint biên dịch thành PDF bytes.
- **`generate_docx(cv_data, template_name)`**: Dùng `python-docx` dựng file Word từ code. Tự động căn chỉnh A4 (21×29.7cm), lề chuẩn, font Times New Roman 11pt, có bảng thông tin cá nhân, bảng điểm môn học (style `Table Grid`), danh sách dự án/kinh nghiệm/chứng chỉ/kỹ năng.
- Xử lý tốt dữ liệu missing/null (dùng `.get()`).

#### 2. `ai-service/app/routers/export.py` ✅ Hoàn thiện
- Endpoint: **`POST /api/export/{format}`** (hỗ trợ `pdf` hoặc `docx`).
- Query param: `template` (mặc định `modern`, hỗ trợ `modern` hoặc `classic`).
- Body param: `CVDataSchema` — nhận toàn bộ cấu trúc dữ liệu CV từ client.
- Trả về file attachment với đúng media type.
- Có validation lỗi (HTTP 400, 500).

> ⚠️ **Lưu ý**: Phân công ghi là `GET /api/export/{format}` nhưng thực tế triển khai bằng `POST`. Điều này hợp lý hơn vì cần nhận body dữ liệu CV lớn, GET không phù hợp.

#### 3. `ai-service/app/models/schemas.py` ✅ Hoàn thiện
- Thêm các Pydantic schema: `ProfileSchema`, `ProjectSchema`, `CertificationSchema`, `ExperienceSchema`, `GradeSchema`, `CVDataSchema` (schema tổng hợp).

#### 4. `ai-service/app/templates/modern.html` ✅ Hoàn thiện
- Thiết kế 2 cột hiện đại, chuẩn A4 (210mm × 297mm).
- Sidebar trái (35%, nền tối `#0f172a`): Avatar bo tròn, thông tin liên hệ, kỹ năng dạng pill/tag, ngôn ngữ.
- Nội dung phải (65%, nền trắng): Summary, Học vấn, Bảng điểm, Dự án, Kinh nghiệm, Chứng chỉ, Hoạt động.

#### 5. `ai-service/app/templates/classic.html` ✅ Hoàn thiện
- Thiết kế 1 cột cổ điển, font Serif (Times New Roman, Georgia).
- Header căn giữa, phân cách bằng đường kẻ ngang.
- Phù hợp cho CV xin việc chính thức, trang trọng.

#### 6. `ai-service/Dockerfile` ✅ Cập nhật
- Thêm các system dependencies cho WeasyPrint: `libpango-1.0-0`, `libpangocairo-1.0-0`, `libgdk-pixbuf-2.0-0`, `libffi-dev`, `shared-mime-info`.

#### 7. `ai-service/requirements.txt` ✅ Cập nhật
- Thêm 3 package mới: `weasyprint>=60.0`, `python-docx>=1.1.0`, `Jinja2>=3.1.0`.

### 🏆 Đánh giá tổng thể Ngày 8

| Tiêu chí | Đánh giá |
|---|---|
| Hoàn thành nhiệm vụ | **3/3 (100%)** |
| Chất lượng code | Tốt — có xử lý lỗi, validation, xử lý null |
| Tích hợp hệ thống | Đã register router vào `main.py`, tương thích với schema dữ liệu hiện tại |
| Sản phẩm bàn giao | API xuất PDF & DOCX hoạt động, 2 template HTML đầy đủ |

---

## 📌 Phần 2: Hiện trạng toàn bộ AI Service (tính đến hết Ngày 8)

### Các service đã hoàn thành (Ngày 1→8)

| Service | File | Người làm | Ngày |
|---------|------|-----------|------|
| JD Parser (Docling) | `jd_parser_service.py` | Đức Toàn | N2 |
| Embedding (OpenAI) | `embedding_service.py` | Đức Toàn | N2 |
| Vector Search (Qdrant + Cohere Rerank) | `vector_search_service.py` | Đức Toàn | N6 |
| GitHub Scraper (Tavily/SERP) | `project_scraper_service.py` | Đức Toàn | N6 |
| Competency Profile Engine | `competency_service.py` | Minh Hải | N7 |
| LLM CV Generator | `cv_generator_service.py` | Minh Hải | N7 |
| Export PDF & DOCX | `export_service.py` | Đức Toàn | N8 |

### Các router/endpoint đã có

| Router | Prefix | Method | Endpoint |
|--------|--------|--------|----------|
| `health.py` | — | GET | `/health` |
| `parse_jd.py` | — | POST | `/api/parse-jd` |
| `embed.py` | — | POST | `/api/embed` |
| `search.py` | — | POST | `/api/search` |
| `scrape_github.py` | — | POST | `/api/scrape-github` |
| `cv.py` | — | POST | `/api/competency-profile`, `/api/generate-cv` |
| `export.py` | — | POST | `/api/export/{format}` |

### Những gì CHƯA CÓ (cần làm cho Ngày 9)

| Service | File cần tạo | Trạng thái |
|---------|-------------|------------|
| ATS Optimizer | `ats_optimizer_service.py` | ❌ Chưa có |
| Evidence Validator | `validator_service.py` | ❌ Chưa có |
| LangGraph Pipeline (Full Orchestrator) | `app/graph.py` | ❌ Chưa có |
| Full Pipeline Endpoint | `/api/generate-cv/full` | ❌ Chưa có |

---

## 📌 Phần 3: Kế Hoạch Ngày 9 — Minh Hải cần làm gì?

### Nhiệm vụ theo phân công

> **NGÀY 9**: ATS Optimizer, Evidence Validator & LangGraph Pipeline  
> **Mảng**: AI Optimization & Orchestration  
> **Mục tiêu**: Hoàn thiện tối ưu ATS, kiểm tra bằng chứng và đóng gói LangGraph Pipeline.

---

### ✅ Nhiệm vụ 1: Xây dựng `ats_optimizer_service.py`

**Mô tả**: Tạo service tính điểm ATS (Applicant Tracking System) cho CV đã sinh và gợi ý cải thiện.

**Yêu cầu cụ thể**:
- Tính ATS Score dựa trên mức độ khớp giữa nội dung CV đã sinh với JD gốc (keyword matching, skill coverage).
- Gợi ý chỉnh sửa: thiếu keyword nào, nên bổ sung section nào, format có chuẩn không.
- Có thể tận dụng LLM (Gemini/Gemma) để phân tích sâu hơn.

**File cần tạo**: `ai-service/app/services/ats_optimizer_service.py`

**Dữ liệu đầu vào có sẵn để dùng**:
- `competency_service.py` → đã có `competency_profile` (danh sách kỹ năng, skill matching 3 lớp, confidence score).
- `cv_generator_service.py` → đã có `cv.json` (nội dung CV đã sinh từ LLM).
- JD text gốc (đã parse từ Docling).

---

### ✅ Nhiệm vụ 2: Xây dựng `validator_service.py`

**Mô tả**: Tạo service xác thực từng skill/claim trong CV có bằng chứng thật từ môn học hoặc project hay không.

**Yêu cầu cụ thể**:
- Với mỗi skill/kỹ năng được liệt kê trong CV → kiểm tra xem có môn học nào (từ CLO/grades) hoặc project nào chứng minh không.
- Trả về báo cáo validation: skill nào có evidence (✅), skill nào không có evidence (⚠️ cảnh báo).
- Giúp đảm bảo CV sinh ra có tính trung thực, không "bịa" kỹ năng.

**File cần tạo**: `ai-service/app/services/validator_service.py`

**Dữ liệu đầu vào có sẵn để dùng**:
- `vector_search_service.py` → search CLO/môn học liên quan đến từng skill.
- Dữ liệu grades từ Supabase (qua .NET API).
- Dữ liệu projects đã nhập hoặc scrape từ GitHub.

---

### ✅ Nhiệm vụ 3: Đóng gói LangGraph Pipeline (`app/graph.py`)

**Mô tả**: Kết nối toàn bộ 7 bước đã xây (từ Ngày 1→8) thành một pipeline liền mạch bằng LangGraph.

**Yêu cầu cụ thể**:
- Tạo file `app/graph.py` định nghĩa StateGraph với các node tương ứng 7 bước:

```
Step 1: Parse JD (Docling)
   ↓
Step 2: Embedding + Vector Search (tìm môn học khớp)
   ↓
Step 3: Scrape GitHub Projects (nếu có link)
   ↓
Step 4: Build Competency Profile (skill matching 3 lớp)
   ↓
Step 5: Generate CV Content (LLM)
   ↓
Step 6: Validate Evidence (Evidence Validator — MỚI)
   ↓
Step 7: ATS Optimize (ATS Optimizer — MỚI)
   ↓
Output: Final CV JSON + ATS Score + Validation Report
```

- Tạo endpoint mới: **`POST /api/generate-cv/full`** chạy toàn bộ pipeline end-to-end.
- Endpoint nhận đầu vào: JD text/file + student info → trả về CV hoàn chỉnh + ATS score + validation report.

**File cần tạo**:
- `ai-service/app/graph.py` (LangGraph StateGraph)
- Router mới hoặc thêm endpoint vào `ai-service/app/routers/cv.py`

**Các service có sẵn để import và kết nối**:
- `jd_parser_service.py` → Step 1
- `embedding_service.py` + `vector_search_service.py` → Step 2
- `project_scraper_service.py` → Step 3
- `competency_service.py` → Step 4
- `cv_generator_service.py` → Step 5
- `validator_service.py` → Step 6 (MỚI — cần tạo)
- `ats_optimizer_service.py` → Step 7 (MỚI — cần tạo)

---

### 📋 Checklist bàn giao Ngày 9

- [ ] Tạo file `ai-service/app/services/ats_optimizer_service.py`
- [ ] Tạo file `ai-service/app/services/validator_service.py`
- [ ] Tạo file `ai-service/app/graph.py` (LangGraph StateGraph)
- [ ] Tạo/cập nhật router với endpoint `POST /api/generate-cv/full`
- [ ] Register router mới vào `ai-service/app/main.py` (nếu tạo router riêng)
- [ ] Kiểm thử endpoint `/api/generate-cv/full` chạy end-to-end
- [ ] Cập nhật `requirements.txt` nếu cần thêm package (ví dụ: `langgraph`)
- [ ] Commit & Push lên branch `minhhai` → Tạo Pull Request vào `main`

---

### ⚠️ Lưu ý kỹ thuật quan trọng cho Minh Hải

1. **Package `langgraph`**: Kiểm tra xem `requirements.txt` hiện tại đã có `langgraph` chưa. Nếu chưa, cần thêm vào và chạy `docker compose up -d --build ai-service`.
2. **Endpoint export đã dùng POST**: Đức Toàn triển khai `POST /api/export/{format}` (không phải GET như phân công ban đầu). Khi tích hợp vào LangGraph pipeline, cần gọi đúng method POST kèm body `CVDataSchema`.
3. **Schemas đã có sẵn**: File `ai-service/app/models/schemas.py` đã định nghĩa đầy đủ `CVDataSchema`, `ProfileSchema`, `ProjectSchema`,... — nên tái sử dụng, không cần tạo lại.
4. **Docker**: Sau khi thêm thư viện mới vào `requirements.txt`, nhớ chạy `docker compose up -d --build ai-service` để cài đặt.
