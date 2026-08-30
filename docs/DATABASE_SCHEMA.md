# Database Schema

PostgreSQL, schema owned entirely by Flyway (`backend/src/main/resources/db/migration`,
`V1`–`V16` today). Hibernate's `ddl-auto` is `validate` — the JPA entities must
match the migrations, never the other way around. A root-level
`db/migrations/V1__phase1_schema.sql` also exists outside `backend/`; it's an
earlier/duplicate copy of the same phase-1 schema — the live source of truth is
`backend/src/main/resources/db/migration/`.

## Entity-relationship overview

```
departments ──┬──< employees >──┬──< users (1:1, auth login)
              │                 │
        head_employee_id        ├──< attendance
        (FK → employees)         │
                                 ├──< leave_requests >── approved_by (→ employees)
                                 ├──< leave_balances
                                 ├──< salary_structures (versioned, one "current" per employee)
                                 ├──< payslips >── payroll_runs
                                 │        └──< payslip_earnings
                                 ├──< notifications
                                 ├──< notification_preferences (1:1)
                                 └──< messages (sender + recipient, both → employees, ON DELETE RESTRICT)

payroll_statutory_settings, tds_slabs, professional_tax_slabs — versioned
reference/config tables, not tied to a specific employee.
```

## Core tables (V1 — phase 1)

**`departments`** — `id`, `name` (unique), `head_employee_id` (FK → employees,
added after `employees` exists to avoid a circular bootstrap problem),
`created_at`, `updated_at`.

**`employees`** — `id`, `employee_code` (unique, e.g. `EMP0001`), `first_name`,
`last_name`, `email` (unique), `phone`, `department_id` (FK, `SET NULL` on
delete), `manager_id` (self-referencing FK, nullable), `designation`,
`date_of_joining`, `work_state` (added V5, backfilled to `'Maharashtra'` in V15),
`status` (`ACTIVE` / `INACTIVE` / `TERMINATED`),
`created_at`, `updated_at`, `created_by`, `updated_by`. Indexed on
`department_id`, `manager_id`, `status`.

**`users`** — auth login, one-to-one with `employees` (`employee_id UNIQUE`,
`ON DELETE CASCADE`). `email`, `password_hash` (BCrypt), `role` (`ADMIN` / `HR`
/ `MANAGER` / `EMPLOYEE`), `last_login_at`, `is_active`. Not every employee has
a `users` row — only those with portal access.

**`attendance`** — `employee_id` (FK, cascade delete), `attendance_date`,
`clock_in`, `clock_out`, `status` (`PRESENT` / `ABSENT` / `HALF_DAY` /
`LATE`). `UNIQUE (employee_id, attendance_date)` — one record per employee per
day. Indexed on `(employee_id, attendance_date)` and, since V11, on
`(attendance_date, status)` to support the dashboard's cross-employee daily
aggregation without a full table scan.

**`leave_requests`** — `employee_id` (FK, cascade delete), `leave_type`
(`SICK` / `CASUAL` / `EARNED`), `start_date`, `end_date`
(`CHECK end_date >= start_date`), `status` (`PENDING` / `APPROVED` /
`REJECTED`), `approved_by` (FK → employees, nullable), `reason`.

**`leave_balances`** — `employee_id`, `leave_type`, `year`, `total`, `used`,
`remaining` (a `GENERATED ALWAYS AS (total - used) STORED` column — the DB
computes it, not the application). `UNIQUE (employee_id, leave_type, year)`.
Backfilled for existing employees in V14; automatically provisioned on onboarding
and rolled over annually on Dec 1.

## Notifications (V3, extended V10 & V13)

**`notifications`** — `recipient_employee_id` (FK, cascade delete), `type`
(`LEAVE_REQUEST_SUBMITTED` / `LEAVE_REQUEST_APPROVED` / `LEAVE_REQUEST_REJECTED`
/ `ATTENDANCE_REMINDER` [V10] / `MESSAGE` [V13] / `GENERAL`), `title`,
`message`, `link`, `is_read`, `created_at`. Indexed for the unread-badge query
and the paginated "latest first" list.

> **Recurring gotcha, twice so far:** the `type` check constraint is a
> hand-maintained list separate from the Java-side enum — adding a new
> notification type in code requires a matching Flyway migration to extend
> the `CHECK`, or inserts fail with a `DataIntegrityViolationException`
> (surfaced to the client as a generic 500). This bit the team once already
> (V13, when messaging was added) — worth remembering before adding a new
> notification type.

**`notification_preferences`** (V10) — one row per employee
(`employee_id UNIQUE`), `leave_decision_enabled`, `new_leave_request_enabled`,
`attendance_reminder_enabled`, all defaulting to `true`. Rows are created
lazily on first read/write — a missing row means "everything on."

## Payroll (V5–V9, V15, India-specific)

**`employees.work_state`** (V5, backfilled V15) — Indian state for Professional Tax
calculation. Wired end-to-end through `EmployeeRequestDto`, `EmployeeResponseDto`,
and the frontend employee form. Existing rows backfilled with `'Maharashtra'` to
activate PT deductions against V9 slabs.

**`salary_structures`** — versioned per employee: `basic`, `hra`,
`conveyance_allowance`, `special_allowance`, `other_allowance`, `ctc_annual`,
`effective_from`, `effective_to` (nullable = currently active). A revision
never updates a row in place — it closes the previous one and inserts a new
row, since a payslip may already reference the old one. A partial unique index
enforces exactly one currently-active structure per employee
(`WHERE effective_to IS NULL`).

**`payroll_runs`** — `period_month`, `period_year` (`UNIQUE` together),
`status` (`DRAFT` / `PROCESSED` / `LOCKED`), `processed_at`, `processed_by`.

**`payroll_statutory_settings`** — versioned PF/ESI/TDS parameters
(`effective_from`/`effective_to` range). Originally scoped with PF/ESI
employee+employer rates and wage ceilings only (V5); V6 extended it with
EPS/EDLI/admin-charge columns and TDS Section 87A rebate fields once the
calculator classes needed them. **V7's seed row is explicitly flagged in its
own migration comment as sourced from public guidance, not verified against
official sources — needs sign-off from a CA/compliance consultant before real
payroll runs against it.**

**`tds_slabs`** — new-regime income tax brackets, versioned by
`financial_year` (e.g. `'2026-2027'`) — a Budget change is a new seed row set,
not a code change. Seeded for FY2026-27 in V8.

**`professional_tax_slabs`** — state-specific bands
(`state`, `from_amount`/`to_amount`, `monthly_amount`, effective range).
Seeded in V9 with Maharashtra slabs.

**`payslips`** — frozen computed output per `(payroll_run_id, employee_id)`:
`working_days`, `paid_days`, `gross_earnings`, PF/ESI (employee + employer),
`professional_tax`, `tds`, `total_deductions`, `net_pay`, `pdf_path`. Never
recalculated in place — a correction means re-running the payroll run, which
produces fresh rows. **`payslip_earnings`** holds the per-component breakdown
(`component_name`, `amount`) for each payslip.

## Messaging (V12, hardened V16)

**`messages`** — deliberately flat: `sender_employee_id`, `recipient_employee_id`
(both `REFERENCES employees(id) ON DELETE RESTRICT` via V16 to prevent destructive
cascade deletes), `body`, `is_read`, `created_at`, `CHECK (sender_employee_id <> recipient_employee_id)`.
No separate "threads" table — a thread is derived as "all messages between
these two employee IDs," avoiding a join to render a conversation. Composite
indexes cover both directions of the sender/recipient pair (newest first) plus
a partial index on unread messages for the badge count.

## Migration history summary (V1–V16)

| Version | Description |
|---|---|
| `V1` | Core Phase 1 schema (employees, departments, users, attendance, leave) |
| `V2` | Initial seed data (superseded by V4) |
| `V3` | In-app notifications table |
| `V4` | Large idempotent seed data (15 depts, 150 employees, ~122 users, attendance, leave) |
| `V5` | Payroll schema (salary structures, payroll runs, statutory settings, payslips) + `work_state` column |
| `V6` | Statutory settings alter: EPS, EDLI, admin charge, TDS Section 87A rebate fields |
| `V7` | Seed payroll statutory settings |
| `V8` | Seed TDS slabs for FY2026-27 |
| `V9` | Seed Professional Tax placeholder slabs (Maharashtra) |
| `V10` | Notification preferences table + extend notification type CHECK for `ATTENDANCE_REMINDER` |
| `V11` | Composite index on `attendance (attendance_date, status)` for dashboard queries |
| `V12` | Direct messaging schema |
| `V13` | Extend notification type CHECK for `MESSAGE` |
| `V14` | Backfill leave balance rows for existing employees |
| `V15` | Backfill `work_state = 'Maharashtra'` for existing employees |
| `V16` | Harden `messages` FKs with `ON DELETE RESTRICT` |
