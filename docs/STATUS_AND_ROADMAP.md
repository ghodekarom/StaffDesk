# Status & Roadmap

This is a from-the-code read of what's actually built, what's partially built,
and what known gaps exist — drawn from module READMEs, code comments, and the
migration history, not from the original plan. See
[`archive/`](./archive) for what was originally scoped before Phase 1 began.

## What's implemented end-to-end (frontend + backend)

| Module | Backend | Frontend | Notes |
|---|---|---|---|
| Auth | ✅ | ✅ | JWT login/refresh/register/change-password, BFF pattern on the frontend |
| Employees | ✅ | ✅ | Full CRUD + status transitions |
| Departments | ✅ | ✅ | CRUD + head-of-department assignment |
| Attendance | ✅ | ✅ | Clock in/out, personal + team views, manual override, reminder scheduler |
| Leave | ✅ | ✅ | Requests, balances, approve/reject, team view |
| Messaging | ✅ | ✅ | Direct messages, threads, unread counts |
| Notifications | ✅ | ✅ | In-app notifications + per-employee preferences |
| Payroll | ✅ | ✅ | Salary structures, payroll runs, payslips + PDF — see caveats below |
| Dashboard | ✅ | ✅ | Aggregated Overview page (real queries, no fake fallback data) |

That's a materially larger feature set than the root `README.md`'s "Roadmap"
section suggested — payroll, notifications, and messaging are all built, not
future work.

## Known gaps and flagged risks

These are called out directly in code/migration comments, worth reading before
relying on this in anything beyond local dev or a demo:

- **Payroll statutory figures are unverified.** The seeded PF/ESI/TDS rates
  (`V7__seed_payroll_statutory_settings.sql`) and Professional Tax slabs
  (`V9__seed_professional_tax_slabs_placeholder.sql`) are explicitly flagged
  in their own migration comments as sourced from public guidance, not the
  official government sources, and not signed off by a CA/compliance
  consultant. Do not run real payroll against this data without verifying it
  first.
- **`employees.work_state` isn't wired up.** The column exists (V5) but isn't
  populated or exposed anywhere yet. `EmployeeDirectoryPort` returns `null`
  for it, and `PayrollRunService` treats a null work state as "no
  Professional Tax applied" (logs a warning, doesn't fail the run) — so
  **Professional Tax is effectively not being deducted for anyone yet**,
  even though the calculator and slab table exist.
- **ESI mid-period contribution rule isn't implemented.** Under the ESI Act,
  an employee enrolled at the start of a contribution period (Apr–Sep or
  Oct–Mar) stays ESI-applicable for the rest of that period even if a
  mid-period raise pushes them above the wage ceiling. `EsiCalculator`
  exposes an `alreadyContributingThisPeriod` flag for this, but per its own
  doc comment the rule "can't know that on its own" and depends on the
  caller tracking state across periods — worth confirming this is actually
  wired through `PayrollRunService` before trusting ESI numbers near the
  ceiling.
- **Payroll role model is a default assumption, not confirmed.** A comment in
  `PayrollRunController` states plainly: ADMIN/HR can trigger runs and view
  all payslips, MANAGER has no payroll access, EMPLOYEE is self-service
  only — "adjust the `@PreAuthorize` expressions once the team confirms the
  real role model."
- **Notification `type` CHECK constraint is hand-maintained, separate from
  the Java enum.** This has already caused one production-shaped bug (V13):
  adding `MESSAGE` as a notification type in code without a matching Flyway
  migration to extend the DB constraint caused inserts to fail with a
  `DataIntegrityViolationException`, surfaced to the client as a generic 500.
  Keep this in mind before adding any new notification type.
- **No automated CI/CD pipeline** — the root README's roadmap item is still
  accurate here; tests exist (`./mvnw test`) but nothing runs them
  automatically on push/PR yet.
- **No frontend test suite** — Jest + React Testing Library are mentioned as
  the target stack but no config or test files exist yet. Backend has 9 JUnit
  test classes, concentrated in payroll calculation logic.
- **No `LICENSE` file** — flagged in the root README; add one (e.g. MIT) if
  open-sourcing.
- **No `docker-compose.yml`** tying frontend + backend + Postgres together for
  one-command local dev — only the backend has a Dockerfile.

## Roadmap (as reflected in code, not just aspiration)

- [ ] Confirm and lock down the payroll role model (`PayrollRunController`)
- [ ] Wire `employees.work_state` through so Professional Tax actually applies
- [ ] Verify PF/ESI/TDS/Professional-Tax figures against official sources;
      get compliance sign-off
- [ ] Confirm ESI mid-period contribution handling end-to-end
- [ ] CI/CD pipeline
- [ ] Frontend test coverage
- [ ] Expanded backend test coverage beyond payroll/employee/notification
- [ ] `docker-compose.yml` for one-command local dev
- [ ] `LICENSE` file
