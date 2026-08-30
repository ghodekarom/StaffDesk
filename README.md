# StaffDesk — Employee Management System (EMS)

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Java](https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_4.1-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

StaffDesk is a full-stack Employee Management System that helps organizations
manage employees, departments, attendance, leave, payroll, and internal
communication — all from a single, modern dashboard.

**Live Demo:** [https://staffdesk-ashy.vercel.app/](https://staffdesk-ashy.vercel.app/)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [Testing](#testing)
- [Documentation](#documentation)
- [Project Status](#project-status)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

StaffDesk (internally, `ems` — Employee Management System) is split into two
independently deployable services:

- **`frontend/`** — a Next.js 14 (App Router) dashboard consumed by admins,
  HR, managers, and employees, with role-based navigation and UI.
- **`backend/`** — a Spring Boot 4.1 (Java 21) REST API handling auth,
  business logic, and persistence against PostgreSQL, with the schema
  entirely owned by Flyway migrations.

The frontend never talks to the database directly — every data operation
goes through the backend's `/api/v1/**` REST API.

## Features

- 🔐 **Authentication** — JWT-based login with refresh-token rotation, using
  a BFF (backend-for-frontend) pattern so the refresh token never touches
  browser-readable JS state; route protection via middleware
- 👥 **Employee Management** — create, view, update employee records, manage
  active/inactive/terminated status transitions
- 🏢 **Department Management** — manage departments and assign department
  heads
- 🕒 **Attendance Tracking** — clock-in/out widget, personal and team
  attendance views, manual overrides for HR/admin, automated clock-in
  reminders for employees who haven't checked in
- 🌴 **Leave Management** — submit leave requests, track balances by leave
  type, approve/reject as a manager/HR/admin, team leave view
- 💰 **Payroll** — India-specific payroll engine: salary structure revisions,
  monthly payroll runs, and payslip generation (with PDF download) computing
  PF, ESI, Professional Tax, and TDS from versioned statutory settings —
  see [caveats in Project Status](#project-status) before relying on the
  figures for real payroll
- 💬 **Messaging** — direct employee-to-employee messaging with threaded
  conversations and unread counts
- 🔔 **Notifications** — in-app notifications for leave decisions, new leave
  requests, attendance reminders, and messages, with per-employee
  preferences to opt in/out of each type
- 📊 **Dashboard & Analytics** — overview page with live-computed metrics and
  charts (via Recharts): headcount, attendance trends, pending leave, and
  department breakdowns
- 🎨 **Modern UI/UX** — command palette, toast notifications, dark/light
  theme toggle, responsive design with Tailwind CSS and Framer Motion
  animations

## Tech Stack

**Frontend**
- [Next.js 14](https://nextjs.org/) (App Router) + React 18 + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) for styling, with a custom
  light/dark design-token system
- [Framer Motion](https://www.framer.com/motion/) for animation
- [Recharts](https://recharts.org/) for data visualization
- [Lucide React](https://lucide.dev/) for icons

**Backend**
- Java 21 + [Spring Boot 4.1](https://spring.io/projects/spring-boot)
- Spring Security with JWT authentication (`jjwt`), method-level
  `@PreAuthorize` role checks
- Spring Data JPA
- [Flyway](https://flywaydb.org/) for database migrations (schema is
  Flyway-owned; Hibernate `ddl-auto` is `validate`, never `update`)
- [springdoc-openapi](https://springdoc.org/) → Swagger UI
- Maven (with Maven Wrapper)
- JUnit 5 + Mockito for tests

**Database**
- PostgreSQL, schema versioned entirely through Flyway migrations

**Deployment**
- Frontend: [Vercel](https://vercel.com/)
- Backend: Dockerized Spring Boot service — multi-stage build, runs as a
  non-root user, reads `$PORT` at runtime (see `backend/Dockerfile`)

## Project Structure

```
staffdesk/
├── backend/                          # Spring Boot REST API
│   ├── src/main/java/com/staffdesk/ems/
│   │   ├── auth/                     # Authentication & JWT security
│   │   ├── employee/                 # Employee CRUD
│   │   ├── department/               # Department management
│   │   ├── attendance/               # Attendance tracking + reminder scheduler
│   │   ├── leave/                    # Leave requests & balances
│   │   ├── payroll/                  # Salary structures, payroll runs, payslips
│   │   │   └── service/calculation/  # PF, ESI, Professional Tax, TDS calculators
│   │   ├── messaging/                # Direct employee-to-employee messages
│   │   ├── notification/             # In-app notifications + preferences
│   │   ├── dashboard/                # Aggregated Overview page endpoint
│   │   ├── common/                   # Shared exceptions & DTOs
│   │   └── config/                   # Security (CORS, JWT filter), Swagger config
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/             # Flyway SQL migrations (V1–V13)
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                         # Next.js dashboard
│   ├── app/
│   │   ├── (auth)/login/             # Login page
│   │   ├── (dashboard)/              # Protected dashboard routes
│   │   │   ├── overview/
│   │   │   ├── employees/
│   │   │   ├── departments/
│   │   │   ├── attendance/ (+ team/)
│   │   │   ├── leave/ (+ team/)
│   │   │   ├── messages/
│   │   │   ├── payroll/ (+ payslips/)
│   │   │   └── settings/             # Notification preferences
│   │   └── api/auth/                 # BFF auth routes (login/logout/refresh)
│   ├── components/                   # Feature & UI components
│   ├── lib/                          # API client, auth context, nav config
│   ├── types/                        # Shared TypeScript types
│   └── package.json
│
└── docs/                             # Full project documentation (start here)
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Java 21 (see `backend/pom.xml`)
- Maven (or use the included `./mvnw` wrapper)
- A running PostgreSQL instance
- Docker (optional, for the containerized backend)

### Backend Setup

```bash
cd backend
cp .env.example .env        # fill in real DB credentials & a real JWT secret
export $(cat .env | xargs)  # or use your IDE's env var support
./mvnw spring-boot:run
```

Flyway runs all migrations automatically on startup. The API starts at
`http://localhost:8080`; Swagger UI is at `http://localhost:8080/swagger-ui.html`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app is available at `http://localhost:3000`.

## Environment Variables

**Backend** (`backend/.env` — see `backend/.env.example`)

```
DB_USER=
DB_PASSWORD=
JWT_SECRET=
```

`application.yml` reads several more, all overridable, with sensible local
defaults: `DB_URL`, `DB_POOL_SIZE`, `DB_DIRECT_URL` (required — used by
Flyway), `PORT`, `JWT_EXPIRATION_MS`, `JWT_REFRESH_EXPIRATION_MS`. Full list
with defaults in [`docs/SETUP_GUIDE.md`](./docs/SETUP_GUIDE.md).

**Frontend** (`frontend/.env.local`)

```
# Server-side only (BFF routes). Never sent to the browser.
BACKEND_API_BASE_URL=http://localhost:8080/api/v1

# Client-side, used for authenticated calls directly to the backend.
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

Keep these as two separate variables even though they point to the same
place locally — see [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md#auth-flow-bff-pattern)
for why.

## Running with Docker

### Full Stack Local Dev (One Command)
```bash
docker-compose up --build
```
This orchestrates:
- `postgres`: PostgreSQL 16 on port 5432 with persistent volume
- `backend`: Spring Boot API on port 8080 (healthcheck monitored)
- `frontend`: Next.js 14 standalone PWA on port 3000

### Standalone Backend Container
```bash
cd backend
docker build -t staffdesk-backend .
docker run -p 8080:8080 --env-file .env staffdesk-backend
```

## Testing

### Backend Test Suite
JUnit 5 + Mockito across 16 test classes (77 test cases) covering all service modules, payroll calculations, statutory deduction algorithms, and reminder/rollover schedulers:

```bash
cd backend
./mvnw test
```

### Frontend Test Suite
Jest + React Testing Library covering offline status hooks, navigation RBAC matrices, and UI component lifecycle:

```bash
cd frontend
npm test
```

## Documentation

Full documentation lives in [`docs/`](./docs) — architecture, API reference,
database schema, setup guide, contribution conventions, and current
status/roadmap. Start at [`docs/README.md`](./docs/README.md).

## Project Status

✅ **All Core Modules & Hardening Complete.** All modules are implemented end-to-end (frontend + backend): authentication, employee management, department management, attendance tracking, leave management, payroll (India-specific: PF, ESI with mid-period raise rules, TDS, Maharashtra Professional Tax via `work_state`), internal messaging, notifications, PWA offline mode, and analytics dashboard.

- **Automated CI/CD**: Active on push/PR via `.github/workflows/ci.yml`.
- **Database Migrations**: 16 Flyway migrations (`V1`–`V16`) with `ddl-auto: validate`.
- **PWA & Offline Support**: Standalone manifest, Service Worker caching, offline fallback page (`/offline`), reactive offline banner.

Full detail in [`docs/STATUS_AND_ROADMAP.md`](./docs/STATUS_AND_ROADMAP.md) and [`docs/PROGRESS.md`](./docs/PROGRESS.md).

## Roadmap

- [x] Confirm and lock down the payroll role model (`PayrollRunController`)
- [x] Wire `employees.work_state` through so Professional Tax actually applies (V15 migration)
- [x] Confirm ESI mid-period contribution handling end-to-end
- [x] CI/CD pipeline (`.github/workflows/ci.yml`)
- [x] Expanded test coverage (Backend: 16 classes, 77 tests; Frontend: Jest + RTL)
- [x] `docker-compose.yml` for one-command local dev
- [x] MIT `LICENSE` file
- [ ] Verify PF/ESI/TDS/Professional-Tax statutory figures against official gazette notifications; obtain compliance sign-off
- [ ] Background Sync for offline writes (PWA Phase 2)
- [ ] Web Push notifications (PWA Phase 2)

See [`docs/STATUS_AND_ROADMAP.md`](./docs/STATUS_AND_ROADMAP.md) for the full list.

## Contributing

Contributions are welcome! Please open an issue to discuss significant
changes before submitting a pull request. See
[`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md) for the coding conventions
actually followed in this codebase (module structure, migration rules, role
checks, etc.) before diving in.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch and open a Pull Request

## License

This project is licensed under the [MIT License](./LICENSE) - see the [LICENSE](./LICENSE) file for details.
