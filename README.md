# generateCV — Tây Đô College Portal & AI CV Builder

generateCV là hệ thống cổng thông tin dành cho Trường Cao đẳng Tây Đô, kết hợp dashboard quản lý dữ liệu học tập với công cụ phân tích Job Description và tạo CV bằng AI.

Hệ thống lấy dữ liệu học tập từ PostgreSQL/Supabase, cung cấp dashboard theo vai trò người dùng và hỗ trợ sinh viên tạo CV dựa trên hồ sơ, điểm số, môn học/CLO, dự án và kinh nghiệm thực tập.

## Tính năng chính

### Cổng thông tin học tập

- Đăng nhập và xác thực bằng JWT.
- Phân quyền theo vai trò: quản trị viên, trưởng khoa, trưởng bộ môn, giảng viên và sinh viên.
- Dashboard tổng quan cho từng nhóm người dùng.
- Theo dõi thời khóa biểu sinh viên, giảng viên và khoa.
- Tra cứu điểm, điểm theo học kỳ, thống kê điểm danh và thông báo.
- Dashboard quản trị: KPI, danh sách sinh viên/giảng viên, thiết bị, audit log và cài đặt.
- Dashboard khoa/bộ môn: tiến độ giảng dạy, giáo viên, câu hỏi/đề thi và thống kê chuyên cần.
- Dashboard giảng viên: lớp học, thống kê, cảnh báo sinh viên và bộ câu hỏi.

### CV Builder cho sinh viên

- Tự động điền thông tin sinh viên và kết quả học tập từ backend.
- Nhập và phân tích JD từ text hoặc file PDF/DOCX/TXT.
- Tìm kiếm môn học và CLO phù hợp với JD bằng semantic vector search.
- Xây dựng competency profile từ thông tin sinh viên, môn học, điểm số và dự án.
- Tạo CV theo dữ liệu đã chọn bằng LLM.
- Tối ưu CV theo ATS và hiển thị phần đề xuất thay đổi.
- Kiểm tra evidence của kỹ năng/dự án trước khi đưa vào CV.
- Live preview CV khổ A4, hỗ trợ template modern/classic.
- Lưu và tải lại CV.
- Dịch CV.
- Xuất CV PDF.
- Tạo phiếu thực tập Mẫu 07 dạng DOCX.
- Sinh viên tải phiếu đã ký lên để giáo viên/trưởng bộ môn/trưởng khoa duyệt hoặc từ chối.

## Kiến trúc hệ thống

~~~text
                         ┌──────────────────────┐
                         │  React + Vite         │
                         │  Frontend :3000       │
                         └──────────┬───────────┘
                                    │
                 ┌──────────────────┴──────────────────┐
                 │                                     │
                 ▼                                     ▼
       ┌──────────────────────┐             ┌──────────────────────┐
       │ .NET 8 Web API       │             │ FastAPI AI Service    │
       │ Backend :5000        │             │ AI Service :8000      │
       └──────────┬───────────┘             └──────────┬───────────┘
                  │                                    │
                  ▼                                    ▼
       ┌──────────────────────┐             ┌──────────────────────┐
       │ Supabase PostgreSQL  │             │ Qdrant Vector DB      │
       │ Dữ liệu portal       │             │ course_clos collection │
       └──────────────────────┘             └──────────────────────┘
~~~

Project gồm bốn container trong Docker Compose:

| Service | Công nghệ | Port | Vai trò |
| --- | --- | ---: | --- |
| frontend | React 19, Vite, TypeScript | 3000 | Giao diện người dùng |
| backend | .NET 8, ASP.NET Core, EF Core | 5000 | Auth, dashboard, dữ liệu portal |
| ai-service | Python 3.11, FastAPI | 8000 | Phân tích JD, vector search, sinh/tối ưu CV |
| qdrant | Qdrant | 6333 | Vector database local tùy chọn |

Backend kết nối Supabase PostgreSQL. AI Service dùng OpenAI Embedding, Qdrant, tùy chọn Cohere/Gemini/GitHub và các service xử lý PDF/DOCX. Khi AI container khởi động, scripts/seed_vectors.py sẽ cố gắng nạp dữ liệu môn học/CLO vào collection course_clos.

## Công nghệ sử dụng

### Frontend

- React, TypeScript, Vite.
- React Router cho routing và protected routes.
- Axios cho gọi API.
- Supabase JS client.
- Recharts cho biểu đồ.
- Phosphor Icons.
- html2pdf.js làm phương án xuất PDF dự phòng phía trình duyệt.

### Backend

- .NET 8 Web API.
- Entity Framework Core và Npgsql.
- Supabase PostgreSQL.
- JWT Bearer Authentication.
- Swagger/OpenAPI.
- Middleware phân quyền theo role.

### AI Service

- FastAPI và Uvicorn.
- Pydantic Settings.
- LangGraph/LangChain cho pipeline CV.
- OpenAI Embeddings.
- Qdrant semantic search.
- Cohere Rerank tùy chọn.
- Gemini tùy chọn cho sinh/tối ưu CV.
- pypdf, BeautifulSoup, lxml và các fallback nhẹ cho đọc tài liệu.
- WeasyPrint, python-docx và Jinja2 cho xuất PDF/DOCX.

## Cấu trúc thư mục

~~~text
generate-cv/
├── backend/                         # .NET 8 Web API
│   ├── Controllers/                 # API theo module/role
│   ├── Data/Entities/               # Entity và AppDbContext
│   ├── DTOs/                        # DTO cho student/teacher
│   ├── Middleware/                  # RoleAuthorizationMiddleware
│   ├── Services/                    # Auth, dashboard, schedule, report...
│   ├── Program.cs                   # DI, DB, JWT, CORS, Swagger, seed
│   ├── appsettings.json             # Cấu hình backend mẫu
│   └── Dockerfile
├── backend.Tests/                   # Unit tests cho backend
├── frontend/                        # React + Vite frontend
│   ├── src/components/              # Layout, forms, preview, charts
│   ├── src/context/                 # AuthContext
│   ├── src/pages/                   # Trang theo từng role
│   ├── src/services/                # Backend/AI/internship API clients
│   ├── src/utils/                   # Validation và Supabase client
│   └── Dockerfile
├── ai-service/                      # FastAPI AI service
│   ├── app/routers/                 # Health, JD, embedding, search, CV, export
│   ├── app/services/                # Parser, embedding, search, generator...
│   ├── app/models/                  # Pydantic schemas và prompts
│   ├── app/templates/               # HTML/DOCX templates
│   ├── scripts/                     # Seed/reseed vector và tạo tài liệu CLO
│   ├── requirements.txt
│   └── Dockerfile
├── CLO/                             # Tài liệu chương trình đào tạo/CLO
├── docs/                            # Thiết kế, kế hoạch, phân tích và hướng dẫn
├── docker-compose.yml               # Chạy toàn bộ stack
├── .env.example                     # Biến môi trường tổng
└── README.md
~~~

## Yêu cầu môi trường

### Chạy bằng Docker Compose — khuyến nghị

- Docker Desktop hoặc Docker Engine.
- Docker Compose v2 (docker compose).
- Quyền truy cập Supabase PostgreSQL.
- API key cho các tính năng AI tương ứng.

### Chạy thủ công

- .NET 8 SDK.
- Node.js 22 trở lên, npm.
- Python 3.11 trở lên.
- Một Qdrant local hoặc Qdrant Cloud.

## Cấu hình biến môi trường

Không commit file .env thật lên Git. Repository chỉ chứa các file mẫu.

### 1. File .env ở thư mục gốc

Tại thư mục có docker-compose.yml:

~~~bash
cp .env.example .env
~~~

Điền các biến:

~~~env
DATABASE_URL=Host=...;Port=5432;Database=postgres;Username=...;Password=...;SSL Mode=Require
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
~~~

DATABASE_URL được Docker Compose truyền vào backend dưới tên ConnectionStrings__DefaultConnection. Hai biến VITE_* được truyền vào frontend.

### 2. File ai-service/.env

~~~bash
cp ai-service/.env.example ai-service/.env
~~~

Các biến thường dùng:

~~~env
APP_NAME=GenerateCV-AIService
APP_ENV=development
PORT=8000

# Dùng Qdrant local trong Docker Compose
QDRANT_URL=http://qdrant:6333
QDRANT_API_KEY=

# Dùng cho embedding
OPENAI_API_KEY=your-openai-key

# Tùy chọn: sinh/tối ưu CV và tóm tắt project bằng Gemini
GEMINI_API_KEY=your-gemini-key
LLM_MODEL=gemini-2.5-flash

# Tùy chọn: rerank kết quả tìm kiếm
COHERE_API_KEY=your-cohere-key

# Tùy chọn: tăng rate limit khi đọc GitHub
GITHUB_TOKEN=your-github-token

# Tùy chọn cho các script đồng bộ dữ liệu
DATABASE_URL=Host=...;Port=5432;Database=postgres;Username=...;Password=...;SSL Mode=Require
~~~

Nếu dùng Qdrant Cloud, thay QDRANT_URL bằng URL cloud và điền QDRANT_API_KEY. Nếu chạy local không qua Docker, dùng QDRANT_URL=http://localhost:6333.

### 3. File frontend/.env khi chạy frontend riêng

Khi chạy frontend bằng Docker Compose, không cần tạo file này vì Compose lấy biến từ .env tổng. Khi chạy frontend thủ công:

~~~bash
cp frontend/.env.example frontend/.env
~~~

Có thể thêm URL backend/AI nếu không dùng giá trị mặc định:

~~~env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BACKEND_URL=http://localhost:5126
VITE_AI_SERVICE_URL=http://localhost:8000
~~~

Frontend mặc định gọi backend tại http://localhost:5000 và AI Service tại http://localhost:8000. Biến VITE_BACKEND_URL hiện được dùng bởi client internship verification; nhiều page dashboard vẫn dùng URL backend http://localhost:5000 trực tiếp.

## Chạy toàn bộ bằng Docker Compose

### 1. Mở thư mục chính

~~~bash
cd generate-cv
~~~

Đây phải là thư mục chứa docker-compose.yml.

### 2. Tạo và điền các file môi trường

~~~bash
cp .env.example .env
cp ai-service/.env.example ai-service/.env
~~~

Điền secret/API key theo phần Cấu hình biến môi trường.

### 3. Build image

~~~bash
docker compose build
~~~

### 4. Khởi động service

Chạy foreground để xem log:

~~~bash
docker compose up
~~~

Hoặc chạy background:

~~~bash
docker compose up -d
~~~

### 5. Truy cập hệ thống

- Frontend: http://localhost:3000
- Backend Swagger: http://localhost:5000/swagger
- AI Service Swagger: http://localhost:8000/docs
- AI Service ReDoc: http://localhost:8000/redoc
- AI Service health: http://localhost:8000/health
- Qdrant dashboard/API local: http://localhost:6333

### Lệnh Docker hữu ích

~~~bash
# Xem log tất cả service
docker compose logs -f

# Xem log một service
docker compose logs -f ai-service

# Kiểm tra file Compose và biến đã được resolve
docker compose config --quiet

# Xem trạng thái container
docker compose ps

# Dừng container
docker compose down

# Dừng và xóa volume Qdrant (sẽ xóa dữ liệu vector local)
docker compose down -v
~~~

## Chạy thủ công từng service

### Backend .NET

~~~bash
cd backend
dotnet restore
ASPNETCORE_URLS=http://localhost:5000 dotnet run --no-launch-profile
~~~

Frontend hiện gọi backend tại http://localhost:5000 ở nhiều màn hình, nên khi chạy thủ công nên dùng lệnh trên. Nếu chạy theo profile http mặc định, backend sẽ ở http://localhost:5126 và Swagger ở http://localhost:5126/swagger; khi đó cần cập nhật các URL backend trong frontend tương ứng. Khi chạy trong Docker, cổng container 8080 được map ra http://localhost:5000.

Backend đọc ConnectionStrings:DefaultConnection từ appsettings.json; biến môi trường có tên ConnectionStrings__DefaultConnection sẽ override cấu hình này.

### Frontend React

~~~bash
cd frontend
cp .env.example .env
npm ci
npm run dev
~~~

Frontend chạy tại http://localhost:5173.

Các lệnh kiểm tra:

~~~bash
npm run build
npm run lint
npm run preview
~~~

### AI Service

~~~bash
cd ai-service
python -m venv .venv
source .venv/bin/activate       # macOS/Linux
# Windows PowerShell: .venv\Scripts\Activate.ps1

pip install -r requirements.txt
cp .env.example .env
~~~

Nếu Qdrant đã chạy tại localhost:6333, có thể seed vector trước:

~~~bash
python scripts/seed_vectors.py
~~~

Khởi động API:

~~~bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
~~~

## Frontend routes

| Route | Role | Chức năng |
| --- | --- | --- |
| /login | Public | Đăng nhập |
| /admin | 99 | Admin dashboard |
| /admin/logs | 99 | Audit logs |
| /admin/devices | 99 | Thiết bị |
| /admin/settings | 99 | Cài đặt |
| /admin/teachers | 99 | Danh sách giảng viên |
| /admin/students | 99 | Danh sách sinh viên |
| /faculty | 50 | Dashboard khoa |
| /faculty/teachers | 50 | Giảng viên trong khoa |
| /faculty/attendance | 50 | Thống kê chuyên cần |
| /department | 20 | Dashboard bộ môn |
| /department/progress | 20 | Tiến độ giảng dạy |
| /department/questions | 20 | Bộ câu hỏi |
| /teacher | 10 | Dashboard giảng viên |
| /teacher/schedule | 10 | Thời khóa biểu |
| /teacher/exams | 10 | Dữ liệu/bộ đề thi |
| /teacher/internship-verifications | 10, 20, 50 | Duyệt thực tập/Mẫu 07 |
| /student | 1 | Dashboard sinh viên |
| /student/announcements | 1 | Thông báo |
| /student/scores | 1 | Điểm |
| /student/schedule | 1 | Thời khóa biểu |
| /student/cv | 1 | CV Builder |
| /student/jd-match | 1 | Phân tích JD và matching |

## Backend API chính

Base URL Docker: http://localhost:5000.

| Nhóm | Endpoint |
| --- | --- |
| Auth | POST /api/auth/login, GET /api/auth/me |
| Admin | GET /api/admin/dashboard, /audit-logs, /devices, /devices/list, /settings, /teachers, /students |
| Faculty | GET /api/faculty/dashboard, /teachers |
| Department | GET /api/department/dashboard, /questions |
| Teacher | GET /api/teacher/dashboard, /question-suites |
| Student | GET /api/student/dashboard, /announcements, /scores, /{id}/scores/filtered |
| Schedule | GET /api/schedule/student/{id}, /teacher/{id}, /faculty/{id}, /semesters |
| Attendance | GET /api/attendance/heatmap/{classId}, /recent |
| Reports | GET /api/reports/cv-data/{studentId}, /attendance/export, /exams/export |
| Saved CV | GET/POST /api/saved-cvs, GET /api/saved-cvs/{id} |
| Internship | GET /api/internship-verifications/mine, GET /pending, POST /, GET /{id}/file, POST /{id}/approve, POST /{id}/reject |

Các endpoint cần xác thực dùng JWT Bearer token. Chi tiết request/response có trong Swagger.

## AI Service API chính

Base URL: http://localhost:8000.

| Nhóm | Endpoint | Mục đích |
| --- | --- | --- |
| Health | GET /, GET /health | Kiểm tra service và Qdrant |
| JD Parser | POST /api/parse-jd | Đọc JD từ text hoặc file |
| Embedding | POST /api/embed | Tạo embedding |
| Search | POST /api/search | Semantic search môn học/CLO, tùy chọn Cohere rerank |
| GitHub | POST /api/scrape-github | Đọc repo, README, file tree và tóm tắt project |
| Competency | POST /api/competency-profile | Tạo hồ sơ năng lực |
| CV | POST /api/generate-cv | Sinh CV từ competency profile |
| Pipeline | POST /api/generate-cv/full | Chạy pipeline competency → CV → ATS → validation |
| ATS | POST /api/optimize-ats, /api/auto-optimize | Tối ưu CV theo JD |
| Validation | POST /api/validate-evidence | Kiểm tra claim dựa trên evidence |
| Export | POST /api/export/pdf, /api/export/mau07 | Xuất PDF hoặc Mẫu 07 DOCX |
| Translation | POST /api/translate/cv | Dịch dữ liệu CV |

Swagger AI Service tại http://localhost:8000/docs hiển thị schema request/response đầy đủ.

## Luồng tạo CV

~~~text
Nhập/upload JD
        ↓
Parse JD và trích xuất kỹ năng
        ↓
Embedding + tìm môn học/CLO trong Qdrant
        ↓
Sinh competency profile
        ↓
Kết hợp hồ sơ sinh viên, điểm, project và kinh nghiệm
        ↓
Sinh CV bằng LLM
        ↓
ATS optimize + validate evidence
        ↓
Review, lưu CV, dịch hoặc xuất PDF/DOCX
~~~

Frontend có fallback cục bộ cho một số thao tác khi AI Service chưa sẵn sàng, nhưng các chức năng semantic search, sinh CV, xuất Mẫu 07 và một số thao tác tối ưu cần AI Service hoạt động.

## Dữ liệu và quyền truy cập

Các role đang được sử dụng trong frontend/backend:

| Role | Nhóm |
| ---: | --- |
| 99 | Admin |
| 50 | Trưởng khoa |
| 20 | Trưởng bộ môn |
| 10 | Giảng viên |
| 1 | Sinh viên |

Backend có DbSeeder cho dữ liệu phát triển. Dữ liệu nghiệp vụ chính nằm trong Supabase PostgreSQL, còn tài liệu chương trình đào tạo/CLO được lưu trong thư mục CLO và được dùng bởi các script seed vector.

Không nên coi môi trường hiện tại là production-ready nếu chưa thay JWT secret mặc định, giới hạn CORS, bảo vệ Swagger và quản lý secret bằng secret manager.

## Kiểm tra trước khi bàn giao

~~~bash
# Kiểm tra Compose
docker compose config --quiet

# Frontend
npm --prefix frontend run build
npm --prefix frontend run lint

# Backend
dotnet test backend.Tests/backend.Tests.csproj

# AI Service (khi checkout có test suite)
python -m pytest -q ai-service
~~~

## Tài liệu liên quan

- docs/full-cv-pipeline-integration.md: tích hợp pipeline CV.
- docs/generate_cv_plan.md: kế hoạch phát triển CV Builder.
- docs/dashboard_master_plan.md: kế hoạch dashboard.
- docs/mo_ta_chuc_nang_theo_role.md: mô tả chức năng theo role.
- docs/database_index_plan.md: kế hoạch index database.
- docs/swagger.json: tài liệu API được lưu trong repository.

## Bảo mật

- Không commit .env, API key, password DB hoặc token GitHub.
- Chỉ chia sẻ các file .env.example khi bàn giao source.
- Nếu secret đã từng bị push lên remote, cần revoke/rotate ngay cả khi đã xóa file.
- Khi deploy thật, thay JWT secret mặc định và cấu hình CORS theo domain cụ thể.
- Qdrant local không nên expose trực tiếp ra Internet nếu không có authentication.
