# StaffDesk — Technical Debt Tracker

> Last updated: 2026-08-29
> Items are sourced from: code comments, migration comments, `STATUS_AND_ROADMAP.md`, and post-implementation review.
> See [PROGRESS.md](./PROGRESS.md) for the feature roadmap.

---

## Severity legend

| Level | Meaning |
|---|---|
| 🔴 **Critical** | Will cause incorrect behaviour or data corruption in production |
| 🟠 **High** | Significant gap — blocks production use for that feature area |
| 🟡 **Medium** | Works but with a known limitation or footgun |
| 🔵 **Low** | Hygiene, maintainability, or nice-to-have hardening |

---

## Payroll

### 🟢 Professional Tax wiring (`employees.work_state`) — RESOLVED
- `work_state` is now exposed in `EmployeeRequestDto`, `EmployeeResponseDto`, `EmployeeServiceImpl`, the frontend `employee-form.tsx` (Indian state dropdown), and backfilled for all existing employees via `V15__backfill_work_state_maharashtra.sql`. Professional Tax slabs (seeded V9) are now resolved during payroll runs.

### 🟢 Payroll role model — RESOLVED
- Role model confirmed and documented in `PayrollRunController`: ADMIN/HR have run and aggregate viewing permissions; MANAGER and EMPLOYEE have self-service access to own payslips.

### 🟠 Statutory figures unverified (PF / ESI / TDS / Professional Tax)
- **Where:** `V7__seed_payroll_statutory_settings.sql`, `V8__seed_tds_slabs.sql`, `V9__seed_professional_tax_slabs_placeholder.sql`
- **Problem:** All three seed files contain explicit migration-level comments stating the figures are sourced from public guidance, not official government sources, and have not been signed off by a CA or compliance consultant.
  - V9 uses Maharashtra PT bands chosen only because they matched an existing test — the actual operating state has not been decided.
- **Fix:** Verify all figures against official gazette notifications; get CA sign-off; add a new versioned migration row for each corrected value (never edit existing seed rows — payslips may reference them).

### 🟢 ESI mid-period contribution rule — VERIFIED & TESTED
- Verified in `PayrollRunService.java` (`existsEsiApplicablePriorInPeriod`) and added test in `PayrollRunServiceTest.java` confirming that an employee whose gross wages rise above 21,000 mid-period continues to have ESI deducted for the remainder of the contribution period.

---

## Notifications

### 🟠 `notifications.type` CHECK constraint is hand-maintained (separate from Java enum)
- **Where:** `notifications` table CHECK constraint (first added in V3, extended in V10 and V13), `NotificationType` Java enum
- **Problem:** Adding a new notification type requires **two** coordinated changes: the Java enum value and a Flyway migration to extend the DB CHECK constraint. This already caused a production-shaped bug: `MESSAGE` was added as a Java enum value without a matching migration, causing all notification inserts for messaging events to fail with `DataIntegrityViolationException` → generic 500 to the client. The V13 migration was the post-hoc fix.
- **Fix options:**
  - (Short term) Add a code-review checklist item: "Did you update both the enum and the migration?"
  - (Long term) Change the column from `VARCHAR` + CHECK to a Postgres `ENUM` type managed by Flyway, or drop the CHECK and enforce at the application layer only.

---

## Backend, Testing & Infrastructure

### 🟢 Employee delete safety — RESOLVED
- Soft-delete enforced via `EmployeeServiceImpl.delete()` (`status -> INACTIVE`), and DB-level `messages` FKs hardened with `ON DELETE RESTRICT` via `V16__harden_employee_fk_no_delete.sql` preventing cascading message destruction or FK crashes.

### 🟢 Leave error responses — RESOLVED
- Added handlers in `GlobalExceptionHandler` for `HttpMessageNotReadableException` (malformed JSON / invalid enum values) and `IllegalStateException`, and migrated `LeaveExceptionHandler` to return consistent `ApiErrorResponse` DTOs.

### 🟢 CI/CD pipeline — RESOLVED
- Added `.github/workflows/ci.yml` running Java 21 Maven test suites, package validation, frontend linting, Next.js production builds, and Jest test runs on every push and PR to `master`.

### 🟢 Backend test coverage — RESOLVED
- 16 test classes, 77 tests covering all service modules (`DepartmentService`, `AttendanceService`, `LeaveService`, `MessageService`, `DashboardService`, `EmployeeService`, `PayrollRunService`, statutory calculators, and reminder/rollover schedulers).

### 🟢 Frontend test suite — RESOLVED
- Configured Jest + React Testing Library in `frontend/` with tests covering offline status hooks, RBAC navigation permissions, and UI badges.

### 🟢 `docker-compose.yml` for one-command local dev — RESOLVED
- Root-level `docker-compose.yml` orchestrates PostgreSQL 16, backend Spring Boot API, and frontend Next.js application with automatic healthcheck dependencies and environment configuration.

### 🟢 `application.yml` debug mode — RESOLVED
- `debug: false` is now configured in `application.yml` to prevent sensitive configuration leaks in non-development deployments.

### 🟢 Swagger/OpenAPI public exposure — RESOLVED
- Swagger UI (`/swagger-ui/**`, `/swagger-ui.html`) and OpenAPI docs (`/api-docs/**`) now require authentication in `SecurityConfig.java`.
### 🟢 `LICENSE` file (MIT) — RESOLVED
- Root-level MIT License added for StaffDesk Contributors (2026).

---

## PWA-specific (future hardening)

---

## PWA-specific (future hardening)

### 🔵 Background Sync not implemented
- **Where:** Service Worker / `next.config.mjs` workboxOptions
- **Problem:** Currently offline writes (e.g. sending a message or submitting a leave request while offline) will fail silently — the user gets a network error. There is no queue-and-retry mechanism.
- **Fix:** Add Workbox `BackgroundSync` plugin to the mutation endpoints (`POST /api/v1/messages`, `POST /api/v1/leave/requests`). Requires a `backgroundSync` entry in `workboxOptions.runtimeCaching`.

### 🔵 Web Push notifications not implemented
- **Where:** Backend notification module, frontend service worker
- **Problem:** The PWA manifest and service worker are in place, but there is no Web Push setup — no VAPID keys, no push subscription endpoint, no service worker `push` event handler.
- **Fix (backend):** Add `/api/v1/push/subscribe` (store `PushSubscription` JSON per employee), VAPID key config, and trigger `webpush.sendNotification()` from `NotificationService`.
- **Fix (frontend):** Call `serviceWorkerRegistration.pushManager.subscribe()` after SW registration; handle `push` event in SW to show `self.registration.showNotification(...)`.

### 🔵 Install prompt not surfaced in the UI
- **Where:** Any dashboard page
- **Problem:** The browser fires `beforeinstallprompt` but StaffDesk has no UI affordance to let users install the app from within the dashboard itself — they have to use the browser menu.
- **Fix:** Capture the `beforeinstallprompt` event in a React context; render a subtle "Install StaffDesk" button (e.g. in the sidebar footer) that calls `prompt()` on click.
