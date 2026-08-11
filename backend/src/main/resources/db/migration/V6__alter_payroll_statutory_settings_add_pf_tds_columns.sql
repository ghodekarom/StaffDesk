-- V6: Extends payroll_statutory_settings (originally scoped in §4.3) with columns
-- needed by PfCalculator's employer-side split (EPS/EDLI/admin charge) and
-- TdsCalculator's Section 87A rebate — both flagged as schema gaps while building
-- the pure calculation classes in the previous build step. Nullable because
-- historical settings rows predating this migration won't have them backfilled.

ALTER TABLE payroll_statutory_settings
    ADD COLUMN pf_eps_rate             NUMERIC(5,4),
    ADD COLUMN pf_eps_ceiling          NUMERIC(10,2),
    ADD COLUMN pf_edli_rate            NUMERIC(5,4),
    ADD COLUMN pf_admin_charge_rate    NUMERIC(5,4),
    ADD COLUMN pf_admin_charge_minimum NUMERIC(10,2),
    ADD COLUMN tds_rebate_threshold    NUMERIC(12,2),
    ADD COLUMN tds_rebate_max_amount   NUMERIC(10,2);
