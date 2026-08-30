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

### 🟡 ESI mid-period contribution rule not wired end-to-end
- **Where:** `EsiCalculator.alreadyContributingThisPeriod` flag, `PayrollRunService`
- **Problem:** Under the ESI Act, an employee enrolled at the start of a contribution period (Apr–Sep or Oct–Mar) remains ESI-applicable for that entire period even if a mid-period raise pushes them above the wage ceiling. `EsiCalculator` exposes a flag for this, but per its own doc comment it "can't know that on its own" — the caller must track state across periods. It is unconfirmed whether `PayrollRunService` actually wires this through.
- **Fix:** Audit `PayrollRunService` → `EsiCalculator` call site; implement cross-period state tracking if missing; add an integration test covering the mid-period raise scenario.

---

## Notifications

### 🟠 `notifications.type` CHECK constraint is hand-maintained (separate from Java enum)
- **Where:** `notifications` table CHECK constraint (first added in V3, extended in V10 and V13), `NotificationType` Java enum
- **Problem:** Adding a new notification type requires **two** coordinated changes: the Java enum value and a Flyway migration to extend the DB CHECK constraint. This already caused a production-shaped bug: `MESSAGE` was added as a Java enum value without a matching migration, causing all notification inserts for messaging events to fail with `DataIntegrityViolationException` → generic 500 to the client. The V13 migration was the post-hoc fix.
- **Fix options:**
  - (Short term) Add a code-review checklist item: "Did you update both the enum and the migration?"
  - (Long term) Change the column from `VARCHAR` + CHECK to a Postgres `ENUM` type managed by Flyway, or drop the CHECK and enforce at the application layer only.

---

## Backend & Data Integrity

### 🟢 Employee delete safety — RESOLVED
- Soft-delete enforced via `EmployeeServiceImpl.delete()` (`status -> INACTIVE`), and DB-level `messages` FKs hardened with `ON DELETE RESTRICT` via `V16__harden_employee_fk_no_delete.sql` preventing cascading message destruction or FK crashes.

### 🟢 Leave error responses — RESOLVED
- Added handlers in `GlobalExceptionHandler` for `HttpMessageNotReadableException` (malformed JSON / invalid enum values) and `IllegalStateException`, and migrated `LeaveExceptionHandler` to return consistent `ApiErrorResponse` DTOs.

### 🟡 No CI/CD pipeline
- **Where:** Root repo
- **Problem:** Tests (`./mvnw test`) exist and pass but are never run automatically on push or PR. A broken build can land on `master` undetected.
- **Fix:** Add a GitHub Actions workflow: `push → mvnw test → (optional) Docker build`. A basic starter:
  ```yaml
  # .github/workflows/backend-ci.yml
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-java@v4
          with: { java-version: '21', distribution: 'temurin' }
        - run: cd backend && ./mvnw test
  ```

### 🟢 `application.yml` debug mode — RESOLVED
- `debug: false` is now configured in `application.yml` to prevent sensitive configuration leaks in non-development deployments.

### 🟢 Swagger/OpenAPI public exposure — RESOLVED
- Swagger UI (`/swagger-ui/**`, `/swagger-ui.html`) and OpenAPI docs (`/api-docs/**`) now require authentication in `SecurityConfig.java`.

### 🔵 Backend test coverage is concentrated, not broad
- **Where:** `src/test/java/com/staffdesk/ems/`
- **Problem:** 9 test classes, all focused on payroll calculation, employee service, notification service/preferences, payroll run service, and attendance scheduler. Zero coverage for: auth flows, department service, leave service, messaging, dashboard aggregation.
- **Fix:** Incrementally add JUnit 5 + Mockito tests for uncovered service classes. Integration tests with `@SpringBootTest` + Testcontainers (Postgres) for repository layer.

### 🔵 No `docker-compose.yml` for one-command local dev
- **Where:** Root of repo
- **Problem:** Setting up locally requires manually starting Postgres, configuring `.env`, and running frontend + backend separately. Only the backend has a Dockerfile.
- **Fix:** Add a `docker-compose.yml` at the repo root:
  ```yaml
  services:
    postgres:   # standard postgres:16-alpine image
    backend:    # builds from backend/Dockerfile, depends_on postgres
    frontend:   # builds from frontend/ with Node 18
  ```

---

## Frontend

### 🟡 No frontend test suite
- **Where:** `frontend/`
- **Problem:** Jest + React Testing Library are the stated target stack, but no `jest.config.*`, no `__tests__/`, no test files of any kind exist.
- **Fix:** `npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom ts-jest`; add `jest.config.ts`; start with critical paths: auth context, `useOfflineStatus`, `apiFetch` retry logic.

### 🟡 PWA: `sharp` left as a devDependency after icon generation
- **Where:** `frontend/package.json`
- **Problem:** `sharp` was installed to run the one-off icon generation script (`scripts/generate-icons.mjs`). It's a large native module and has no role in the production build or ongoing development.
- **Fix:** `npm uninstall sharp` after confirming icons are committed; remove `scripts/generate-icons.mjs` or move it to a top-level `tools/` folder outside the frontend package.

### 🔵 No `LICENSE` file
- **Where:** Repo root
- **Problem:** The project has no declared licence. Anyone who finds the repo cannot legally use, fork, or contribute to it.
- **Fix:** Add a `LICENSE` file (MIT is typical for internal tooling you may later open-source):
  ```
  MIT License
  Copyright (c) 2026 StaffDesk Contributors
  ```

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
