-- V9: Placeholder Professional Tax slab seed — §7.1 (which state to seed first,
-- and whether employees.work_state is required or optional) is STILL AN OPEN
-- DECISION, not resolved by this migration.
--
-- Maharashtra is used here only because it matches the illustrative slab shape
-- already exercised in ProfessionalTaxCalculatorTest, so the calculator layer has
-- something real to resolve end-to-end against. These figures are NOT verified
-- against the current Maharashtra Profession Tax Act notification — confirm the
-- real bands/amounts (and pick the actual state your entity operates from) before
-- relying on this for a real payroll run.
--
-- employees.work_state doesn't exist yet either — this table can't be wired into
-- PayrollRunService until that column is added (§7.1).

INSERT INTO professional_tax_slabs (state, from_amount, to_amount, monthly_amount, effective_from, effective_to) VALUES
    ('Maharashtra', 0.00,     7500.00,  0.00,   '2026-04-01', NULL),
    ('Maharashtra', 7500.00,  10000.00, 175.00, '2026-04-01', NULL),
    ('Maharashtra', 10000.00, NULL,     200.00, '2026-04-01', NULL);
