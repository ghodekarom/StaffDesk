# Architecture

## System overview

```
┌─────────────────────┐        HTTPS/REST         ┌──────────────────────────┐
│   Next.js 14 App      │ ─────────────────────────▶ │   Spring Boot 4.1 API     │
│   (Vercel)             │ ◀───────────────────────── │   (Docker / Render)        │
│                        │           JSON              │                            │
│  - App Router pages    │                              │  auth · employee · dept   │
│  - BFF routes for auth │                              │  attendance · leave       │
│  - React state + fetch │                              │  payroll · messaging      │
└─────────────────────┘                              │  notification · dashboard  │
                                                        └──────────────┬─────────────┘
                                                                       │
                                                              Spring Data JPA
                                                                       │
                                                            ┌──────────▼──────────┐
                                                            │   PostgreSQL DB      │
                                                            │  (Flyway-managed)    │
                                                            └───────────────────────┘
```

The frontend never talks to the database directly — every data operation goes
through the Spring Boot REST API at `/api/v1/**`.

## Tech stack

**Frontend** (`frontend/`)
- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS 3, custom design tokens (`app/globals.css`) with light/dark theme
  support via a `data-theme` attribute (no `dark:` prefixes needed)
- Framer Motion for animation, Recharts for the dashboard charts, Lucide React
  for icons
- `@ducanh2912/next-pwa` for Workbox-powered Progressive Web App (PWA) support,
  Service Worker caching, offline fallback page (`/offline`), and installability
- No global state library — auth state lives in a React context
  (`lib/auth-context.tsx`); everything else is fetched per-page

**Backend** (`backend/`)
- Java 21, Spring Boot 4.1
- Spring Web, Spring Data JPA, Spring Security (method-level `@PreAuthorize`)
- PostgreSQL, schema versioned entirely through Flyway (`src/main/resources/db/migration`,
  currently at `V16`) — Hibernate's `ddl-auto` is set to `validate`, never `update`
- JWT auth via `jjwt`
- springdoc-openapi → Swagger UI at `/swagger-ui.html` (authenticated session required)
- JUnit 5 + Mockito for backend tests (11 test classes, covering payroll calculations,
  employee service, leave provisioning & rollover, and notifications)

**Deployment**
- Frontend: Vercel (live at the URL in the root `README.md`)
- Backend: Docker multi-stage build (`backend/Dockerfile`) — Maven build stage,
  slim `eclipse-temurin:21-jre-alpine` runtime stage, runs as a non-root user,
  reads `$PORT` at runtime (Render-style)

## Backend module layout

Every module follows the same internal shape: `controller/ → service/ → repository/
→ entity/ → dto/`, with per-module `exception/` classes handled by a
`@RestControllerAdvice` per module (plus a `common/exception/GlobalExceptionHandler`
for anything not module-specific).

```
com.staffdesk.ems
├── auth/          Login, register, refresh, change-password, JWT filter, Role enum
├── employee/       Employee CRUD + status (ACTIVE/INACTIVE/TERMINATED) transitions
├── department/     Department CRUD, head-of-department assignment
├── attendance/     Clock-in/out, personal + team views, manual override, reminder scheduler
├── leave/          Leave requests, balances, approve/reject workflow
├── payroll/         Salary structures, payroll runs, payslip generation + PDF
│   └── service/calculation/   PF, ESI, Professional Tax, TDS calculators (India-specific)
├── messaging/       Direct employee-to-employee messages, threads, unread counts
├── notification/    In-app notifications + per-employee notification preferences
├── dashboard/        Single aggregated summary endpoint for the Overview page
├── common/           Shared exceptions, DTOs (ApiErrorResponse), GlobalExceptionHandler
└── config/            SecurityConfig (CORS, JWT filter chain), Swagger config
```

Payroll is the most India-specific module: `payroll_statutory_settings`,
`tds_slabs`, and `professional_tax_slabs` are versioned reference tables so that
a Budget/rate change becomes a new seed row, not a code change — see
[`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md).

## Auth flow (BFF pattern)

The refresh token never reaches the browser as readable JS state — the frontend's
own Next.js API routes act as a backend-for-frontend layer:

1. Login form submits → `AuthProvider.login()` → `POST /api/auth/login`
   (frontend's own route, not the Spring Boot backend directly).
2. That route calls the real backend (`POST /api/v1/auth/login`) server-side,
   gets `{accessToken, refreshToken, ...}` back, sets `refreshToken` as an
   **httpOnly cookie**, and returns everything *except* the refresh token to
   the browser.
3. `AuthProvider` holds the access token in React state only — it's gone on a
   full page reload, by design.
4. Authenticated data calls go through `apiFetch()` (`frontend/lib/api.ts`),
   which calls the backend **directly** with `Authorization: Bearer <token>`.
5. On page reload, `AuthProvider` immediately calls `POST /api/auth/refresh`;
   the browser auto-attaches the httpOnly cookie, and if valid, the session is
   silently restored.
6. A 401 mid-session triggers one refresh-and-retry in `apiFetch`; if that also
   fails, the user is bounced to `/login`.
7. `frontend/middleware.ts` does a cheap cookie-presence check before dashboard
   routes render, to avoid a flash of protected UI for logged-out users.

Backend-side, `JwtAuthenticationFilter` validates the bearer token on every
request and populates the security context; `@PreAuthorize("hasRole('ADMIN')")` /
`hasAnyRole(...)` annotations on controller methods enforce the four roles
(`ADMIN`, `HR`, `MANAGER`, `EMPLOYEE`) — see `nav-config.ts` on the frontend for
which nav items/pages map to which roles, and
[`API_REFERENCE.md`](./API_REFERENCE.md) for the role required on each endpoint.

## Frontend structure

```
frontend/
├── app/
│   ├── (auth)/login/               Login page
│   ├── (dashboard)/                 Protected routes (guarded by middleware.ts)
│   │   ├── overview/                 Dashboard summary + charts
│   │   ├── employees/                 Employee list, create/edit, status changes
│   │   ├── departments/                Department list, create/edit
│   │   ├── attendance/  (+ team/)       Clock widget, personal + team views
│   │   ├── leave/        (+ team/)      Leave requests, balances, approvals
│   │   ├── messages/      ([employeeId]/) Direct messaging
│   │   ├── payroll/        (+ payslips/)  Salary structures, runs, payslips
│   │   └── settings/                       Notification preferences
│   └── api/auth/                    BFF routes: login / logout / refresh
├── components/                       Feature components (attendance/, leave/, etc.)
│   └── ui/                            Shared primitives (button, modal, badge, toasts, ...)
├── lib/                               api.ts, auth-context.tsx, auth-cookies.ts, nav-config.ts
├── types/                             TypeScript types mirroring backend DTOs
└── middleware.ts                      Route guard (cookie presence check)
```

`frontend/UI-REDESIGN-NOTES.md` documents a specific visual redesign pass
(theme tokens, dark mode, font choices) and is kept in place as component-level
implementation notes rather than folded into this doc.
