# Tây Đô College Portal - General Agent Rules

## 1. Tech Stack & Directories
- **Frontend**: React (Vite + TypeScript) located in `/frontend`
- **Backend**: .NET 8 Web API located in `/backend`
- **Environment**: Containerized development via Docker Compose at the root

## 2. Core Development Rules (QUY TẮC CỐT LÕI)

### 2.1 UI/UX Pro Max Design System
- **Theme**: Premium Vibrant & Block-based Dark theme.
  - Background: `#020617` (`--color-background`)
  - Accent/CTA: `#22C55E` (`--color-accent`)
  - Primary text: `#F8FAFC` (`--color-foreground`)
- **Typography**: Heading font: `Inter` | Body font: `Inter`
- **Icons**: Always use Phosphor Icons (`@phosphor-icons/react`). **NEVER** use Emojis as structural or navigation icons.
- **Transitions**: State transitions (hover, active, focus) must have 150-300ms ease animations.

### 2.2 Read-Only Database Constraint
- The backend is strictly **Read-Only** for the Supabase database. Only implement GET/READ API endpoints.
- **Exception**: POST `/api/auth/login` is allowed for credential verification.
- **NEVER** perform POST/PUT/DELETE queries modifying database tables.

### 2.3 Docker Compose Hot-Reload Workflow
- Always develop and run tests using the dockerized environment:
  - Frontend: Runs `npm run dev` on port `3000` (mapped to container port `5173`).
  - Backend: Runs `dotnet watch run` on port `5000` (mapped to container port `8080`).
- Ensure local directories (`./frontend` and `./backend`) are mounted as volumes for instant Hot-Reload.
- Never write compiled build files (`bin/`, `obj/`, `node_modules/`) from the host into the container environment. Use anonymous volumes inside `docker-compose.yml`.

### 2.4 Code & Architecture Boundaries
- Soft deletes: Always filter queries where `IsDeleted = false` on EF Core.
- Roles: Always respect the integer-based role authorization:
  - `1`: Student (Sinh viên)
  - `2`: Visiting Teacher (Giáo viên thỉnh giảng)
  - `10`: Full-time Teacher (Giáo viên chính thức)
  - `20`: Dept Head (Trưởng bộ môn)
  - `50`: Dean (Trưởng khoa)
  - `99`: Admin (Quản trị viên)

## 3. Architecture & Coding Standard Rules (QUY TẮC KIẾN TRÚC & CODING)
Luôn luôn tuân thủ các nguyên tắc và công nghệ sau trong quá trình phát triển Backend:
- **EF Core DB First**: Phát triển dựa trên cấu trúc database sẵn có, không tự ý tự tạo migrations bằng code-first để thay đổi schema hiện tại ngoài ý muốn, đảm bảo mapping chính xác các database tables thành EF Core Entities.
- **LINQ**: Sử dụng LINQ tối ưu hiệu năng (phân biệt Deferred Execution vs Immediate Execution), áp dụng các câu truy vấn hiệu quả, tối ưu hóa database queries (tránh N+1 query).
- **Transactions**: Sử dụng transactions khi thực hiện các hoạt động ghi đồng thời hoặc nhiều bước cần tính toàn vẹn (ACID).
- **Clean Architecture & Domain-Driven Design (DDD)**: Tuân thủ cấu trúc phân tầng Clean Architecture (Domain -> Application -> Infrastructure -> Presentation / API) và áp dụng các thiết kế DDD phù hợp (Entities, Value Objects, Aggregates, Repositories).
- **CQRS & MediatR**: Tách biệt luồng xử lý Command (ghi) và Query (đọc) sử dụng pattern CQRS và thư viện MediatR để giữ cho mã nguồn tách biệt, dễ bảo trì và mở rộng.
- **Domain Events**: Sử dụng Domain Events Dispatching để truyền đạt thông tin thay đổi trạng thái giữa các Bounded Contexts hoặc các Entity một cách lỏng lẻo (loose coupling).
- **Dependency Injection (DI) / Keyed DI**: Đăng ký dịch vụ qua ASP.NET Core DI. Sử dụng Keyed DI (đối với .NET 8+) khi cần tiêm các triển khai khác nhau cho cùng một interface dựa trên định danh (Key).
- **SOLID Principles**: Luôn tuân thủ nghiêm ngặt 5 nguyên tắc SOLID trong thiết kế hướng đối tượng để nâng cao tính tái sử dụng, dễ kiểm thử và bảo trì mã nguồn.

