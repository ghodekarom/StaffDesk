> **Archived — pre-development planning doc.** Written before Phase 1 build
> started, kept for historical context on original scoping decisions. It is
> **out of date**: Payroll, Notifications, and Messaging (all "Phase 2" here)
> are already built, and several decisions below (DB schema, module layout)
> changed during implementation. For the current state of the project, see
> [`docs/README.md`](../README.md).

# Employee Management System — Project Documentation

**Version:** 1.0
**Last Updated:** July 2026

---

## 1. Project Overview

The Employee Management System (EMS) is a web application to manage employee records, attendance, leave, payroll, and performance for an organization. This document serves as the single source of truth for architecture, stack, and conventions before development begins.

---

## 2. Finalized Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | **Next.js** (React) + Tailwind CSS | SSR/SSG where useful, API routes only for BFF needs if any |
| Backend | **Java Spring Boot** | Spring Web, Spring Data JPA, Spring Security |
| Database | **PostgreSQL** | Relational — fits employee/department/leave hierarchy |
| ORM | Hibernate (via Spring Data JPA) | |
| Auth | Spring Security + JWT | Role-based: Admin, HR, Manager, Employee |
| File Storage | AWS S3 / MinIO (self-hosted) | Employee documents, profile photos |
| API Docs | Springdoc OpenAPI (Swagger UI) | Auto-generated from code |
| Build Tool | Maven | |
| Containerization | Docker + Docker Compose | Local dev parity with prod |
| Testing (Backend) | JUnit 5 + Mockito | |
| Testing (Frontend) | Jest + React Testing Library | |
| Hosting (initial) | Render (backend + Postgres) + Vercel (frontend) | Free tier for MVP; revisit at scale |

---

## 3. Functional Requirements (Feature List)

### Phase 1 — Core (MVP)
- [ ] Employee CRUD (profile, contact, department, designation, documents)
- [ ] Authentication & role-based access control (Admin / HR / Manager / Employee)
- [ ] Department management & reporting hierarchy
- [ ] Attendance (clock in/out, daily/monthly view)
- [ ] Leave management (apply, approve/reject, balance tracking, holiday calendar)

### Phase 2
- [ ] Payroll (salary structure, payslip generation, deductions)
- [ ] Notifications (email for approvals, announcements)
- [ ] Reports & dashboards (headcount, attendance trends, attrition)
- [ ] Document/policy repository

### Phase 3 (optional, later)
- [ ] Performance management (goals, review cycles)
- [ ] Recruitment/onboarding module
- [ ] Exit management (resignation workflow, F&F settlement)

> Build Phase 1 fully before starting Phase 2. Resist scope creep — a working MVP with 5 modules beats a half-built system with 12.

---

## 4. Non-Functional Requirements

- **Security:** All endpoints authenticated except login/health-check. Passwords hashed (BCrypt). JWT with reasonable expiry + refresh token flow.
- **Performance:** API response time target < 500ms for standard CRUD; paginate all list endpoints.
- **Scalability:** Stateless backend (JWT, no server-side sessions) so it can scale horizontally later.
- **Auditability:** Track created_at/updated_at/created_by/updated_by on all major entities.
- **Data Privacy:** Sensitive fields (salary, personal docs) restricted by role at the query level, not just UI hiding.

---

## 5. System Architecture (High Level)

```
┌─────────────────┐        HTTPS/REST        ┌──────────────────────┐
│   Next.js App    │ ───────────────────────▶ │   Spring Boot API     │
│  (Vercel/Render)  │ ◀─────────────────────── │   (Render/Docker)     │
└─────────────────┘         JSON              └──────────┬────────────┘
                                                            │
                                                    Spring Data JPA
                                                            │
                                                  ┌─────────▼─────────┐
                                                  │   PostgreSQL DB    │
                                                  └────────────────────┘

External: AWS S3 (documents) · SMTP/Twilio (notifications)
```

- Frontend never talks to the DB directly — everything goes through the Spring Boot REST API.
- Auth: login returns JWT (access + refresh); Next.js stores access token in memory, refresh token in httpOnly cookie.

---

## 6. Database Schema (Core Entities — Phase 1)

```
employees
├── id (PK)
├── employee_code (unique)
├── first_name, last_name
├── email (unique), phone
├── department_id (FK → departments)
├── manager_id (FK → employees, nullable — self-referencing)
├── designation
├── date_of_joining
├── status (ACTIVE, INACTIVE, TERMINATED)
├── created_at, updated_at

departments
├── id (PK)
├── name
├── head_employee_id (FK → employees, nullable)

users
├── id (PK)
├── employee_id (FK → employees)
├── email (unique), password_hash
├── role (ADMIN, HR, MANAGER, EMPLOYEE)
├── last_login_at

attendance
├── id (PK)
├── employee_id (FK → employees)
├── date
├── clock_in, clock_out
├── status (PRESENT, ABSENT, HALF_DAY, LATE)

leave_requests
├── id (PK)
├── employee_id (FK → employees)
├── leave_type (SICK, CASUAL, EARNED)
├── start_date, end_date
├── status (PENDING, APPROVED, REJECTED)
├── approved_by (FK → employees, nullable)
├── reason

leave_balances
├── id (PK)
├── employee_id (FK → employees)
├── leave_type
├── total, used, remaining
├── year
```

> Note: this is a starting point, not final DDL. Expand with payroll/performance tables in Phase 2 planning, once Phase 1 entities are validated against real usage.

---

## 7. API Design Conventions

- **Base path:** `/api/v1/...`
- **Naming:** plural nouns for resources — `/api/v1/employees`, `/api/v1/leave-requests`
- **Standard verbs:** GET (list/detail), POST (create), PUT (full update), PATCH (partial update), DELETE
- **Pagination:** `?page=0&size=20&sort=lastName,asc` (Spring's `Pageable`)
- **Error format (consistent shape across all endpoints):**
```json
{
  "timestamp": "2026-07-19T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Employee email already exists",
  "path": "/api/v1/employees"
}
```
- **Auth header:** `Authorization: Bearer <token>`
- All list endpoints must be paginated by default — never return unbounded arrays.

---

## 8. Backend Module Structure

```
com.company.ems
├── employee/       (Employee CRUD, profiles)
├── auth/           (Login, JWT, roles/permissions)
├── attendance/     (Clock in/out, attendance reports)
├── leave/          (Leave requests, approvals, balances)
├── department/     (Departments, org hierarchy)
├── common/         (Shared DTOs, exceptions, base entities, config)
└── config/         (Security config, CORS, Swagger config)
```

Each module follows: `controller/ → service/ → repository/ → entity/ → dto/`

---

## 9. Frontend Structure (Next.js)

```
/app
  /(auth)/login
  /(dashboard)/employees
  /(dashboard)/attendance
  /(dashboard)/leave
  /(dashboard)/departments
/components
  /ui          (buttons, forms, tables — shared primitives)
  /employees   (feature-specific components)
/lib
  /api.ts      (fetch wrapper with auth header injection)
  /auth.ts     (token handling)
/types         (TypeScript types matching backend DTOs)
```

---

## 10. Git Workflow

- **Branches:** `main` (production) ← `develop` (staging) ← `feature/*`
- **Commit convention:** Conventional Commits — `feat:`, `fix:`, `chore:`, `docs:`
- **PRs:** required before merging into `develop`; at minimum a self-review checklist if working solo
- **No direct commits to `main`**

---

## 11. Environment Setup

### Backend (`.env` / `application.yml`)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ems_db
    username: ${DB_USER}
    password: ${DB_PASSWORD}
jwt:
  secret: ${JWT_SECRET}
  expiration: 3600000
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

### Local Dev via Docker Compose
- `postgres` container
- `backend` (Spring Boot, hot reload via devtools)
- Frontend run separately with `npm run dev` (or containerized later)

---

## 12. Deployment Plan (MVP)

1. Backend + Postgres → Render (free tier)
2. Frontend → Vercel (free tier)
3. File storage → AWS S3 free tier / MinIO if avoiding AWS entirely
4. Environment variables set via each platform's dashboard (never committed to repo)

---

## 13. Coding Standards

- **Java:** Google Java Style Guide; DTOs for all API request/response (never expose JPA entities directly)
- **TypeScript:** strict mode on; no `any` unless justified with a comment
- **Validation:** Bean Validation (`@Valid`, `@NotNull`, etc.) on backend; Zod or similar on frontend forms
- **No business logic in controllers** — controllers stay thin, logic lives in services

---

## 14. Open Decisions (to confirm before/during Phase 1)

- [ ] Single-tenant or multi-tenant architecture?
- [ ] Country-specific payroll/tax rules needed?
- [ ] Email provider for notifications (SMTP vs SendGrid vs SES)?
- [ ] Will attendance need biometric/hardware integration, or is web clock-in sufficient for MVP?
