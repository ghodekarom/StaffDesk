-- ============================================================
-- Backfill: leave_balances rows for employees created after the
-- initial V2 seed.
--
-- Root cause (see leave-balance-provisioning-issue.md #9): before this
-- release, EmployeeService.create() never inserted leave_balances rows --
-- only the one-time V2__seed_data.sql script did. Every employee added
-- through the live app since then has zero leave balances: "My leave
-- balance" shows empty (#10) and every leave request submission fails
-- with InsufficientLeaveBalanceException (#11).
--
-- EmployeeService.create() now provisions balances for new hires going
-- forward (see LeaveBalanceProvisioningService), but that only prevents
-- the problem for employees created after this deploy. This migration
-- is the one-off catch-up for everyone already affected (#14).
--
-- Idempotent: the NOT EXISTS guard means running this twice, or against
-- a database where some employees already have partial/complete rows
-- (e.g. from V2's seed), only inserts what's actually missing -- it
-- never duplicates or resets an existing row's `used` value.
--
-- Defaults intentionally match V2__seed_data.sql and
-- LeaveBalanceProvisioningService exactly (SICK 12, CASUAL 12, EARNED 15)
-- so a backfilled row means the same thing as a seeded or newly-created one.
-- ============================================================

INSERT INTO leave_balances (employee_id, leave_type, year, total, used)
SELECT e.id, lt.leave_type, EXTRACT(YEAR FROM CURRENT_DATE)::int, lt.total, 0
FROM employees e
CROSS JOIN (VALUES ('SICK', 12.0), ('CASUAL', 12.0), ('EARNED', 15.0)) AS lt(leave_type, total)
WHERE NOT EXISTS (
    SELECT 1 FROM leave_balances lb
    WHERE lb.employee_id = e.id
      AND lb.leave_type = lt.leave_type
      AND lb.year = EXTRACT(YEAR FROM CURRENT_DATE)::int
);