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
- **ESI mid-period contribution rule isn't implemented.** Under the ESI Act,
  an employee enrolled at the start of a contribution period (Apr–Sep or
- **Notification `type` CHECK constraint is hand-maintained, separate from
  the Java enum.** This has already caused one production-shaped bug (V13):
  adding `MESSAGE` as a notification type in code without a matching Flyway
  migration to extend the DB constraint caused inserts to fail with a
  `DataIntegrityViolationException`, surfaced to the client as a generic 500.
  Keep this in mind before adding any new notification type.

## Roadmap (as reflected in code, not just aspiration)

- [x] Confirm and lock down the payroll role model (`PayrollRunController`)
- [x] Wire `employees.work_state` through so Professional Tax actually applies (V15 backfill + DTO + form)
- [x] Confirm ESI mid-period contribution handling end-to-end (verified in `PayrollRunService` and tested in `PayrollRunServiceTest`)
- [x] CI/CD pipeline (`.github/workflows/ci.yml`)
- [x] Frontend test suite (Jest + React Testing Library)
- [x] Expanded backend test coverage (16 classes, 77 tests)
- [x] `docker-compose.yml` for one-command local dev
- [x] `LICENSE` file (MIT)
- [ ] Verify PF/ESI/TDS/Professional-Tax figures against official sources; get compliance sign-off
- [ ] Background Sync for offline writes (PWA Phase 2)
- [ ] Web Push notifications (PWA Phase 2)
