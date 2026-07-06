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
