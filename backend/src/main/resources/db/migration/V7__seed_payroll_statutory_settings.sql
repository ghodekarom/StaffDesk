-- V7: Seeds the payroll_statutory_settings row effective from the start of FY2026-27.
--
-- Figures are sourced from public guidance current as of August 2026 (per the
-- compliance disclaimer in §2 of the scoping doc), NOT pulled live from
-- epfindia.gov.in / esic.gov.in / incometax.gov.in. Verify against those sources —
-- and get sign-off from a CA or payroll compliance consultant — before running
-- real payroll against this row.
--
-- tds_rebate_threshold / tds_rebate_max_amount are illustrative (see
-- TdsCalculatorTest) — the actual Section 87A threshold/cap for FY2026-27 needs
-- confirming against the current CBDT circular before go-live.

INSERT INTO payroll_statutory_settings (
    effective_from, effective_to,
    pf_employee_rate, pf_employer_rate, pf_wage_ceiling,
    pf_eps_rate, pf_eps_ceiling, pf_edli_rate, pf_admin_charge_rate, pf_admin_charge_minimum,
    esi_employee_rate, esi_employer_rate, esi_wage_ceiling,
    tds_regime, tds_standard_deduction, tds_cess_rate, tds_rebate_threshold, tds_rebate_max_amount,
    created_at
) VALUES (
    '2026-04-01', NULL,
    0.1200, 0.1200, 15000.00,
    0.0833, 1250.00, 0.0050, 0.0050, 500.00,
    0.0075, 0.0325, 21000.00,
    'NEW', 75000.00, 0.0400, 1200000.00, 60000.00,
    now()
);
