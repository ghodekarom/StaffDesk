-- ============================================================
-- V15 — Backfill work_state for existing employees
-- ============================================================
-- The work_state column was added in V5 but was never populated via
-- any API endpoint or migration. PayrollRunService treats NULL as
-- "no Professional Tax applied" and logs a warning, so PT has been
-- silently zero for every employee on every payroll run.
--
-- This migration sets all existing employees to 'Maharashtra' to
-- match the Professional Tax slabs seeded in V9. Individual
-- corrections can be made per-employee via the employee edit form
-- (now that work_state is exposed on the API).
UPDATE employees SET work_state = 'Maharashtra' WHERE work_state IS NULL;

-- ============================================================
-- End of V15
-- ============================================================
