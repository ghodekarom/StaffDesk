# API Reference

All endpoints are under base path `/api/v1`. Auth is JWT bearer
(`Authorization: Bearer <accessToken>`) except where noted. This list is
generated from the actual `@*Mapping` / `@PreAuthorize` annotations in
`backend/src/main/java/com/staffdesk/ems/**/controller/`, not from a spec —
if code and doc ever drift, trust the code and update this file.

Interactive docs (Swagger UI) require authentication once the backend is running:
`http://localhost:8080/swagger-ui.html` (or schema at `/api-docs`).

**Roles:** `ADMIN`, `HR`, `MANAGER`, `EMPLOYEE`. "Any authenticated user" means
no `@PreAuthorize` role restriction beyond having a valid token.

## Auth — `/api/v1/auth`

| Method | Path | Role | Notes |
|---|---|---|---|
| POST | `/login` | Public | Returns access + refresh token |
| POST | `/refresh` | Public (valid refresh token) | Rotates the refresh token |
| POST | `/register` | ADMIN | Creates a new user login for an existing employee |
| POST | `/change-password` | Any authenticated user | Self-service password change |

## Employees — `/api/v1/employees`

| Method | Path | Role | Notes |
|---|---|---|---|
| POST | `/` | ADMIN, HR | Create employee |
| GET | `/{id}` | Any authenticated user | Get one employee |
| GET | `/` | Any authenticated user | Paginated list (`?page=&size=&sort=`) |
| PUT | `/{id}` | ADMIN, HR | Full update |
| DELETE | `/{id}` | ADMIN | Delete |
| PATCH | `/{id}/status` | ADMIN, HR | Transition `ACTIVE` / `INACTIVE` / `TERMINATED` |

## Departments — `/api/v1/departments`

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/` | Any authenticated user | List all departments |
| GET | `/{id}` | Any authenticated user | Get one department |
| POST | `/` | ADMIN, HR | Create (name + optional head employee) |
| PUT | `/{id}` | ADMIN, HR | Update |
| DELETE | `/{id}` | ADMIN | Delete |

## Attendance — `/api/v1/attendance`

| Method | Path | Role | Notes |
|---|---|---|---|
| POST | `/clock-in` | Any authenticated user | Clocks in the caller for today |
| POST | `/clock-out` | Any authenticated user | Clocks out the caller for today |
| GET | `/me` | Any authenticated user | Caller's own paginated history |
| GET | `/recent` | ADMIN, HR, MANAGER | Recent records across all employees |
| GET | `/employees/{employeeId}` | ADMIN, HR | One employee's paginated history |
| GET | `/employees/{employeeId}/{date}` | ADMIN, HR | One employee's record for a specific date |
| PUT | `/employees/{employeeId}/{date}` | ADMIN, HR | Manual override (correct a clock-in/out or status) |

A scheduled job (`AttendanceReminderScheduler`) nudges employees who haven't
clocked in yet on weekday mornings, respecting each employee's own
"attendance reminders" notification preference.

## Leave — `/api/v1/leave`

| Method | Path | Role | Notes |
|---|---|---|---|
| POST | `/requests` | Any authenticated user | Submit a leave request |
| GET | `/requests/me` | Any authenticated user | Caller's own requests (paginated) |
| GET | `/balances/me` | Any authenticated user | Caller's leave balances by type |
| POST | `/requests/{id}/cancel` | Any authenticated user | Cancel own pending request |
| GET | `/requests` | ADMIN, HR, MANAGER | All requests (paginated) |
| GET | `/requests/employees/{employeeId}` | ADMIN, HR, MANAGER | One employee's requests |
| POST | `/requests/{id}/approve` | ADMIN, HR, MANAGER | Approve |
| POST | `/requests/{id}/reject` | ADMIN, HR, MANAGER | Reject |

Leave types: `SICK`, `CASUAL`, `EARNED`. Requests overlapping an existing
approved/pending request for the same employee are rejected at the service
layer, as is a balance-exceeding request.

## Payroll — `/api/v1/payroll/**`

Payroll is India-specific: PF (Provident Fund), ESI (Employee State Insurance),
Professional Tax (state-specific), and TDS (new-regime income tax slabs) are
all calculated server-side from versioned statutory settings — see
[`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md).

**Salary structures** — `/api/v1/payroll/salary-structures`

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/me/current` | Any authenticated user | Caller's own current structure |
| POST | `/` | ADMIN, HR | Create a new revision (closes the previous one) |
| GET | `/employees/{employeeId}/current` | ADMIN, HR | One employee's current structure |
| GET | `/employees/{employeeId}/history` | ADMIN, HR | Full revision history (paginated) |

**Payroll runs** — `/api/v1/payroll/runs`

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/{year}/{month}` | ADMIN, HR | Get the run for a period |
| POST | `/{year}/{month}/process` | ADMIN, HR | Process payroll for a period (generates payslips) |
| PATCH | `/{id}/lock` | ADMIN, HR | Lock a processed run (no further changes) |
| GET | `/{runId}/payslips` | ADMIN, HR | List payslips for a run |

> The role model on this controller is explicitly flagged as a **default
> assumption, not confirmed**, in a code comment (MANAGER has no payroll
> access; EMPLOYEE is self-service only via the payslips endpoints below).
> Revisit before this goes further than internal use.

**Payslips** — `/api/v1/payroll/payslips`

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/{payslipId}` | ADMIN, HR | Get one payslip |
| GET | `/me` | EMPLOYEE, MANAGER | Caller's own payslips |
| GET | `/{payslipId}/pdf` | ADMIN, HR, EMPLOYEE, MANAGER | Download payslip as PDF |

## Messaging — `/api/v1/messages`

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/threads` | Any authenticated user | List of conversation threads with last message + unread |
| POST | `/` | Any authenticated user | Send a direct message |
| GET | `/thread/{employeeId}` | Any authenticated user | Paginated conversation with one employee |
| GET | `/unread-count` | Any authenticated user | Total unread across all threads |

Flat design: no separate "thread" table — a thread is derived as "all
messages between these two employee IDs."

## Notifications — `/api/v1/notifications`

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/preferences` | Any authenticated user | Caller's notification preferences |
| PUT | `/preferences` | Any authenticated user | Update preferences |
| GET | `/` | Any authenticated user | Paginated notification list |
| GET | `/unread-count` | Any authenticated user | Unread badge count |
| PATCH | `/{id}/read` | Any authenticated user | Mark one as read |
| POST | `/read-all` | Any authenticated user | Mark all as read |

Notification types: `LEAVE_REQUEST_SUBMITTED`, `LEAVE_REQUEST_APPROVED`,
`LEAVE_REQUEST_REJECTED`, `ATTENDANCE_REMINDER`, `GENERAL`. A missing
preferences row means "everything on" — rows are created lazily on first
read/write rather than at user creation.

## Dashboard — `/api/v1/dashboard`

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/summary?range=today\|week\|month` | Any authenticated user | Aggregated Overview page data (role-scoped) |

Returns total employees, new hires this month, total departments,
present/absent/late counts, hours logged, pending leave count, a
department headcount breakdown, and an attendance trend series. Non-reviewer
callers (EMPLOYEE) receive zeroed/safe org stats while maintaining pending leave.

## Error format

All errors share one shape (`common/dto/ApiErrorResponse`):

```json
{
  "timestamp": "2026-08-20T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Employee email already exists",
  "path": "/api/v1/employees"
}
```
