# Database Schema

PostgreSQL, schema owned entirely by Flyway (`backend/src/main/resources/db/migration`,
`V1`–`V13` today). Hibernate's `ddl-auto` is `validate` — the JPA entities must
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
                                 └──< messages (sender + recipient, both → employees)

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
`date_of_joining`, `status` (`ACTIVE` / `INACTIVE` / `TERMINATED`),
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

## Payroll (V5–V9, India-specific)

**`employees.work_state`** (V5) — nullable column added for Professional Tax
(which is state-specific). **Not yet backfilled or wired into
`PayrollRunService`** — see [`STATUS_AND_ROADMAP.md`](./STATUS_AND_ROADMAP.md).

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
**V9's seed data is a placeholder** (Maharashtra bands, chosen only because
they match what `ProfessionalTaxCalculatorTest` already exercised) — not
verified against the current Profession Tax Act notification, and the state
to actually operate from is still an open decision.

**`payslips`** — frozen computed output per `(payroll_run_id, employee_id)`:
`working_days`, `paid_days`, `gross_earnings`, PF/ESI (employee + employer),
`professional_tax`, `tds`, `total_deductions`, `net_pay`, `pdf_path`. Never
recalculated in place — a correction means re-running the payroll run, which
produces fresh rows. **`payslip_earnings`** holds the per-component breakdown
(`component_name`, `amount`) for each payslip.

## Messaging (V12)

**`messages`** — deliberately flat: `sender_employee_id`, `recipient_employee_id`,
`body`, `is_read`, `created_at`, `CHECK (sender_employee_id <> recipient_employee_id)`.
No separate "threads" table — a thread is derived as "all messages between
these two employee IDs," avoiding a join to render a conversation. Composite
indexes cover both directions of the sender/recipient pair (newest first) plus
a partial index on unread messages for the badge count.

## Seed data

`V4__phase1_schema.sql` is a large, idempotent (truncate-and-reinsert) seed:
15 departments, 150 employees (1 CEO + 15 department heads + 134 staff, Indian
names, realistic designations per department), ~122 user logins (all seeded
with the same password — see migration comment for the credential), ~195
attendance rows (last 5 weekdays for a slice of staff), 150 leave requests
spanning past and future dates, 180 leave balance rows, and 160 notifications.
Useful for local dev and demos; not meant to represent real data.

`V2__seed_data.sql` is an earlier, smaller seed superseded by V4 (V4's header
comment notes it does not depend on V2 and replaces it with a larger set).
