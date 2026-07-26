# StaffDesk — Employee Management System

A full-stack Employee Management System built with **Spring Boot** (backend) and **Next.js** (frontend). StaffDesk handles employee records, departments, attendance tracking, and leave management, with JWT-based authentication and role-based access control.

> **Status: Phase 1 Complete** ✅
> Core modules (auth, employees, departments, attendance, leave) are implemented end-to-end across both backend and frontend, with a responsive, mobile-friendly UI.

---

## Tech Stack

**Backend**
- Java 21
- Spring Boot 4.1.0
- Spring Security + JWT (access + refresh token flow)
- Spring Data JPA
- PostgreSQL
- Flyway (schema migrations)
- Maven

**Frontend**
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Client-side data fetching with a lightweight caching layer

---

## Features Completed in Phase 1

### 🔐 Authentication
- Login with JWT access + refresh tokens
- Refresh tokens stored as httpOnly cookies, rotated and single-use
- Silent session restore on page load
- Role-based route protection (`ADMIN`, `HR`, `MANAGER`, `EMPLOYEE`)

### 👥 Employees
- Full CRUD (create, view, edit, delete)
- Paginated, sortable employee listing
- Department and manager assignment

### 🏢 Departments
- Full CRUD with department head assignment
- Validation against duplicate names and invalid head-employee references

### 🕒 Attendance
- Clock in / clock out
- Personal attendance history (paginated, 30-day window)
- Team attendance view for `ADMIN` / `HR` roles
- Manual override support for corrections

### 📅 Leave
- Leave request submission with date-range validation
- Overlap and leave-balance checks
- Approve / reject workflow for managers
- Leave balance tracking per employee
- Team leave view with status filtering

### 📱 UI / UX
- Fully responsive layout — collapsible mobile navigation drawer, responsive tables, and stacked headers on small screens
- Light/dark theme toggle
- Consistent design system (badges, buttons, modals, forms) shared across all modules

---

## Project Structure

```
ems/
├── db/migrations/          # Flyway SQL migrations
├── docs/                   # Project documentation
├── backend/                # Spring Boot REST API
│   └── src/main/java/com/staffdesk/ems/
│       ├── auth/            # Login, JWT issuance/refresh, users
│       ├── employee/        # Employee CRUD
│       ├── department/      # Department CRUD
│       ├── attendance/      # Clock in/out, history, team view
│       ├── leave/           # Leave requests, balances, approvals
│       ├── common/          # Shared exception handling, base DTOs
│       └── config/          # Security configuration
└── frontend/                # Next.js app
    ├── app/
    │   ├── (auth)/login/     # Public login page
    │   └── (dashboard)/      # Authenticated pages (sidebar layout)
    │       ├── employees/
    │       ├── departments/
    │       ├── attendance/
    │       └── leave/
    ├── components/           # Feature + shared UI components
    ├── lib/                  # API client, auth context, config
    └── types/                # Shared TypeScript types
```

---

## Getting Started

### Prerequisites
- Java 21
- Node.js 18+
- PostgreSQL 14+
- Maven (or use the included `mvnw` wrapper)

### Backend Setup

```bash
cd backend
cp .env.example .env    # fill in DB credentials, JWT secret, etc.
./mvnw spring-boot:run
```

The API runs on `http://localhost:8080` by default. Flyway will run migrations automatically on startup.

### Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_BASE_URL
npm install
npm run dev
```

The app runs on `http://localhost:3000` by default.

---

## Architecture Notes

- The frontend never talks to the database directly — every data operation goes through the Spring Boot REST API.
- Only token issuance/refresh (`/api/auth/*`) is routed through Next.js's own backend-for-frontend (BFF) API routes; all other requests hit the Spring Boot backend directly from the browser.
- `GlobalExceptionHandler` in the backend acts as the catch-all `@RestControllerAdvice`, with module-specific exception handlers (e.g. `AttendanceExceptionHandler`, `LeaveExceptionHandler`) layered on top for domain-specific error responses.

---

## Roadmap (Phase 2+)

- [ ] Payroll module
- [ ] Performance review module
- [ ] Notifications (email/in-app)
- [ ] Reporting & analytics dashboards
- [ ] Bulk employee import/export

---

## License

Internal project — license to be determined.
