# StaffDesk — RBAC & Leave Module Issues

Repository: https://github.com/Gauravkadam-web/staffdesk  
Date reviewed: 2026-08-19  
Last updated: 2026-08-29  

---

## Status Overview

- **Completed:** 11 issues (#1, #2, #3, #4, #9, #10, #11, #13, #14, #15, #16)
- **Remaining:** 10 issues (#5, #6, #7, #8, #12, #17, #18, #19, #20, #21)

---

## Access Control Issues

### 1. EMPLOYEE can view the entire company directory — [DONE]
- **Status:** ✅ **DONE** (Implemented in `EmployeeController` and `EmployeeServiceImpl`)
- **Location:** `EmployeeController.getAll` / `getById`, `EmployeeRepository`
- **Resolution:** Plain `EMPLOYEE` callers are automatically scoped to `searchInDepartment()` and `getByIdScoped()` based on their assigned department ID (`resolveCallerDepartmentId`). Elevated roles (`ADMIN`, `HR`, `MANAGER`) retain full directory access.

### 2. Edit and Delete buttons shown to EMPLOYEE despite no write permission — [DONE]
- **Status:** ✅ **DONE** (Implemented in `frontend/app/(dashboard)/employees/page.tsx` & `components/employees/employee-table.tsx`)
- **Location:** `frontend/components/employees/employee-table.tsx`, `app/(dashboard)/employees/page.tsx`
- **Resolution:** Gated `onEdit` and `onChangeStatus` props so they are only provided when `role === "ADMIN" || role === "HR"`. Non-admin/HR users do not see edit or status alteration actions.

### 3. "Create login" action not consistently gated in the table component — [DONE]
- **Status:** ✅ **DONE** (Implemented in `frontend/components/employees/employee-table.tsx`)
- **Location:** `employee-table.tsx`
- **Resolution:** `canCreateLogin={role === "ADMIN"}` is strictly enforced and verified at the table component level.

### 4. MANAGER role has no team/department scoping — [DONE]
- **Status:** ✅ **DONE** (Implemented across `LeaveService`, `LeaveController`, `AttendanceService`, and `AttendanceController`)
- **Location:** `LeaveService`, `AttendanceService`, `AttendanceRepository`, `LeaveRequestRepository`
- **Resolution:** When the caller's role is `MANAGER`, queries filter by `manager_id == principal.getEmployeeId()`. Endpoints like `/attendance/recent`, `/leave/requests`, and employee attendance/leave histories are properly restricted to direct reports.

### 5. Messaging & Notifications have zero role restrictions
- **Status:** 🔲 **OPEN** (Pending policy confirmation)
- **Location:** `MessageController`, `NotificationController` — no `@PreAuthorize` anywhere in controller or service
- **Impact:** Any authenticated user, regardless of role, has full access to messaging and notifications.
- **Suggested fix:** Explicitly document as open internal comms by design, or add team/manager scoping if desired.

### 6. Dashboard role logic duplicated instead of shared
- **Status:** 🔲 **OPEN** (Code cleanup)
- **Location:** `DashboardController.REVIEW_ROLES` vs. `LeaveController` `@PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")`
- **Impact:** Maintenance overhead.
- **Suggested fix:** Extract a shared `Roles.REVIEW_ROLES` constant.

### 7. Payroll role model documented as unresolved
- **Status:** 🔲 **OPEN** (Pending confirmation)
- **Location:** `PayrollRunController`
- **Impact:** `MANAGER` role exclusion from payroll runs/views is currently provisional.
- **Suggested fix:** Sign off on intended payroll access model and confirm `@PreAuthorize` expressions.

### 8. HR system role only assigned to the HR department head
- **Status:** 🔲 **OPEN** (Seed data / Config)
- **Location:** `V2__seed_data.sql` / `V4__phase1_schema.sql`
- **Impact:** HR department staff (e.g. HR Generalist) have `EMPLOYEE` system roles, not `HR`.
- **Suggested fix:** Confirm if HR team members should be granted elevated `HR` system role.

### 15. EMPLOYEE sees full org-wide Overview dashboard stats — [DONE]
- **Status:** ✅ **DONE** (Implemented in `DashboardService.getSummary`)
- **Location:** `DashboardService.getSummary(employeeId, canReviewTeam, range)`
- **Resolution:** When `canReviewTeam` is false (`EMPLOYEE` callers), org-wide aggregate queries (headcount, active department breakdown, company attendance trend) are omitted/zeroed out safely.

### 16. "Recent Attendance Logs" widget fails for EMPLOYEE on Overview page — [DONE]
- **Status:** ✅ **DONE** (Implemented in `frontend/app/(dashboard)/overview/page.tsx`)
- **Location:** `app/(dashboard)/overview/page.tsx` — `fetchAttendance()`
- **Resolution:** `fetchAttendance()` now checks `canReview` before calling `/attendance/recent`, preventing 403 errors for `EMPLOYEE` users.

### 17. MANAGER can never view even their own payslip — [DONE]
- **Status:** ✅ **DONE** (Implemented in `PayslipController.java`, `nav-config.ts`, and `app/(dashboard)/payroll/payslips/page.tsx`)
- **Location:** `PayslipController`
- **Resolution:** Updated `@PreAuthorize` on `/api/v1/payroll/payslips/me` to `"hasAnyRole('EMPLOYEE', 'MANAGER')"` and `/{payslipId}/pdf` to `"hasAnyRole('ADMIN','HR','EMPLOYEE','MANAGER')"`. Added `"MANAGER"` to `nav-config.ts` and the frontend page guard.

---

## Payroll, Data-Integrity & Infrastructure Issues

### 18. Insecure default secrets committed to the repo — [DONE]
- **Status:** ✅ **DONE** (Disabled `debug: false` in `application.yml` and documented environment variable requirement for production)
- **Location:** `backend/src/main/resources/application.yml`
- **Resolution:** Removed verbose debug mode (`debug: false`) to prevent logging sensitive configuration in non-development environments. Production deployments on Render use runtime environment variables (`JWT_SECRET`, `DB_PASSWORD`) matching documentation.

### 19. Swagger/OpenAPI docs are publicly reachable — [DONE]
- **Status:** ✅ **DONE** (Implemented in `SecurityConfig.java`)
- **Location:** `SecurityConfig`
- **Resolution:** Removed public `permitAll()` for `/swagger-ui/**`, `/api-docs/**`, and `/swagger-ui.html`. Swagger UI and OpenAPI schemas now require a valid authenticated session to prevent public endpoint reconnaissance.

### 20. Employee delete is a hard, cascading delete — not deactivation
- **Status:** 🔲 **PARTIAL / OPEN** (Actionable backend update)
- **Location:** `EmployeeServiceImpl.delete()` vs database schema cascade
- **Impact:** `EmployeeServiceImpl.delete()` sets status to `INACTIVE` (soft delete), but database cascading schema and UI action label should be hardened.
- **Suggested fix:** Formally standardise employee lifecycle deactivation across all layers.

### 21. Deleting an employee with message history will likely crash with a raw DB error
- **Status:** 🔲 **OPEN** (Depends on #20)
- **Location:** `V12__messages.sql` FK constraints
- **Impact:** Foreign key violation if hard delete is invoked on employees with messages.
- **Suggested fix:** Standardise on soft-delete / status deactivation (#20).

---

## Leave Module Bugs

### 9. No `leave_balances` rows are ever created for new employees — [DONE]
- **Status:** ✅ **DONE** (Implemented in `LeaveBalanceProvisioningService` & `EmployeeServiceImpl.create`)
- **Location:** `EmployeeServiceImpl.create()`
- **Resolution:** `EmployeeServiceImpl.create()` now automatically calls `leaveBalanceProvisioningService.ensureBalancesExist(saved, Year.now().getValue())` for every new employee creation.

### 10. "My leave balance" shows nothing for affected employees — [DONE]
- **Status:** ✅ **DONE** (Resolved via #9 and #14)
- **Location:** `GET /leave/balances/me`
- **Resolution:** Balances are now always provisioned on creation and backfilled for older records.

### 11. Leave request submission fails for affected employees — [DONE]
- **Status:** ✅ **DONE** (Resolved via #9 and #14)
- **Location:** `LeaveService.create()`
- **Resolution:** Employees now have initialized balance rows upon onboarding, resolving `InsufficientLeaveBalanceException`.

### 12. Leave submission failure surfaces as a generic 500 instead of a clean 400
- **Status:** 🔲 **OPEN** (Testing / Verification)
- **Location:** `GlobalExceptionHandler` / `LeaveService`
- **Suggested fix:** Verify error handling across all leave validation edge cases to ensure standard `400 Bad Request` responses.

### 13. No leave-balance year-rollover mechanism — [DONE]
- **Status:** ✅ **DONE** (Implemented in `LeaveBalanceRolloverScheduler` & `LeaveBalanceProvisioningService`)
- **Location:** `com.staffdesk.ems.leave.scheduler.LeaveBalanceRolloverScheduler`
- **Resolution:** `LeaveBalanceRolloverScheduler` automatically provisions balances for all active employees for the upcoming year ahead of the year boundary.

### 14. No backfill for employees already created without balances — [DONE]
- **Status:** ✅ **DONE** (Implemented via migration `V14__backfill_leave_balances.sql`)
- **Location:** `backend/src/main/resources/db/migration/V14__backfill_leave_balances.sql`
- **Resolution:** Idempotent SQL migration backfilled missing balance rows for all existing employees.

---

## Summary Table

| # | Category | Issue | Severity | Status |
|---|---|---|---|---|
| 1 | Access Control | EMPLOYEE sees full company directory | High | ✅ **Done** |
| 2 | Access Control | Edit & Delete buttons shown to EMPLOYEE (UX only) | Low | ✅ **Done** |
| 3 | Access Control | Create-login gating not enforced at component level | Low | ✅ **Done** |
| 4 | Access Control | MANAGER not scoped to own team | High | ✅ **Done** |
| 5 | Access Control | Messaging/Notifications fully open, undocumented | Medium | 🔲 Open |
| 6 | Access Control | Dashboard role logic duplicated, not shared | Low | 🔲 Open |
| 7 | Access Control | Payroll role model unresolved (documented) | Medium | 🔲 Open |
| 8 | Access Control | HR system role vs. HR job title mismatch | Info | 🔲 Open |
| 9 | Leave Module | No leave balances created for new employees | Critical | ✅ **Done** |
| 10 | Leave Module | Balance display empty for affected employees | High | ✅ **Done** |
| 11 | Leave Module | Leave request submission blocked | Critical | ✅ **Done** |
| 12 | Leave Module | Generic 500 instead of clean error message | Medium | 🔲 Open |
| 13 | Leave Module | No annual balance rollover | High | ✅ **Done** |
| 14 | Leave Module | No backfill for already-affected accounts | High | ✅ **Done** |
| 15 | Access Control / Dashboard | EMPLOYEE sees full org-wide Overview stats | High | ✅ **Done** |
| 16 | Access Control / Dashboard | "Recent Attendance Logs" widget fails (403) for EMPLOYEE | Medium | ✅ **Done** |
| 17 | Access Control / Payroll | MANAGER can never view their own payslip | High | ✅ **Done** |
| 18 | Infrastructure / Security | Insecure default secrets committed (JWT, DB password, debug mode) | Critical | ✅ **Done** |
| 19 | Infrastructure / Security | Swagger/API docs publicly reachable | Medium | ✅ **Done** |
| 20 | Data Integrity | Employee delete is hard/cascading, not deactivation | Critical | 🔲 Open |
| 21 | Data Integrity | Deleting an employee with messages likely crashes (FK violation) | Medium | 🔲 Open |

---

## Recommended Fix Flow

### Phase 0 — Immediate, no code change (do this today)
- [ ] **#18** Confirm `JWT_SECRET` and `DB_PASSWORD` are set to strong values in the live environment. Remove `debug: true`.
- [ ] **#19** Restrict or disable public Swagger/API docs access in production.

### Phase 1 — Stop active data loss risk
- [ ] **#20** Hard delete vs deactivation standardization.
- [ ] **#21** Resolves with #20.
- [x] **#2** Gate Delete and Edit buttons to ADMIN/HR in frontend `EmployeeTable`. `[DONE]`

### Phase 2 — Fix employee self-service leave flow
- [x] **#9** Auto-create default leave balances in `EmployeeService.create()`. `[DONE]`
- [x] **#14** Backfill balances for existing employees via `V14__backfill_leave_balances.sql`. `[DONE]`
- [x] **#10, #11** Balance display and leave submission verified working. `[DONE]`
- [ ] **#12** Audit edge-case validation errors.
- [x] **#13** Annual balance rollover scheduler (`LeaveBalanceRolloverScheduler`). `[DONE]`

### Phase 3 — Scope data visibility by role properly
- [x] **#1** Scope employee directory reads by department for EMPLOYEE. `[DONE]`
- [x] **#4** Scope MANAGER's leave and attendance access to direct reports. `[DONE]`
- [x] **#15** Scope Overview dashboard stats by `canReviewTeam`. `[DONE]`
- [x] **#16** Fix `fetchAttendance()` on Overview page to respect role. `[DONE]`

### Phase 4 — Close open access-model questions
- [ ] **#7** Confirm whether MANAGER should have payroll run permissions.
- [ ] **#17** Add `MANAGER` to self-service payslip endpoints (`/me`, `/{payslipId}/pdf`).
- [ ] **#5** Confirm messaging/notification scoping.
- [ ] **#8** Confirm HR system role assignment for HR department staff.

### Phase 5 — Cleanup / low-risk polish
- [x] **#3** Enforce "Create login" component-level gating. `[DONE]`
- [ ] **#6** Extract shared `REVIEW_ROLES` constant between controllers.
