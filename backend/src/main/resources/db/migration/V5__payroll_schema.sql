-- ============================================================
-- V5 — Payroll (Phase 2)
-- Modules: salary structures, payroll runs, payslips,
--          statutory settings (PF/ESI/TDS/Professional Tax)
--
-- Schema only — no seed data. Reference/config tables
-- (payroll_statutory_settings, tds_slabs, professional_tax_slabs)
-- are populated in a later migration once the applicable state
-- and financial-year figures are confirmed (see Phase 2 scoping
-- doc, section 7 — open decisions).
-- ============================================================

-- ---------- EMPLOYEES: work_state addition ----------
-- Professional Tax is state-specific; the employees table has no
-- location field today. Nullable so this doesn't break existing rows
-- or require backfilling before Phase 2 work continues elsewhere.
ALTER TABLE employees ADD COLUMN work_state VARCHAR(50);

-- ---------- SALARY STRUCTURES ----------
-- Versioned per employee. A revision closes the previous row
-- (sets effective_to) and inserts a new one — historical rows are
-- never updated in place, since a payslip may already reference them.
CREATE TABLE salary_structures (
    id                      BIGSERIAL PRIMARY KEY,
    employee_id             BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    basic                   NUMERIC(10,2) NOT NULL CHECK (basic >= 0),
    hra                     NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (hra >= 0),
    conveyance_allowance    NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (conveyance_allowance >= 0),
    special_allowance       NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (special_allowance >= 0),
    other_allowance         NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (other_allowance >= 0),
    ctc_annual              NUMERIC(12,2) NOT NULL CHECK (ctc_annual >= 0),
    effective_from          DATE NOT NULL,
    effective_to            DATE,
    created_by              BIGINT REFERENCES employees(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE INDEX idx_salary_structures_employee ON salary_structures(employee_id);

-- Enforces "only one currently-active structure per employee" at the
-- database level (effective_to IS NULL = currently active).
CREATE UNIQUE INDEX idx_salary_structures_one_current
    ON salary_structures(employee_id)
    WHERE effective_to IS NULL;

-- ---------- PAYROLL RUNS ----------
CREATE TABLE payroll_runs (
    id              BIGSERIAL PRIMARY KEY,
    period_month    INT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_year     INT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                    CHECK (status IN ('DRAFT', 'PROCESSED', 'LOCKED')),
    processed_at    TIMESTAMPTZ,
    processed_by    BIGINT REFERENCES employees(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (period_month, period_year)
);

-- ---------- PAYROLL STATUTORY SETTINGS ----------
-- Versioned PF/ESI/TDS parameters. A payroll run resolves the row
-- whose effective range covers its period, so historical payslips
-- stay correct even after government-notified rates change.
CREATE TABLE payroll_statutory_settings (
    id                      BIGSERIAL PRIMARY KEY,
    effective_from          DATE NOT NULL,
    effective_to            DATE,
    pf_employee_rate        NUMERIC(5,4) NOT NULL,
    pf_employer_rate        NUMERIC(5,4) NOT NULL,
    pf_wage_ceiling         NUMERIC(10,2) NOT NULL,
    esi_employee_rate       NUMERIC(5,4) NOT NULL,
    esi_employer_rate       NUMERIC(5,4) NOT NULL,
    esi_wage_ceiling        NUMERIC(10,2) NOT NULL,
    tds_regime              VARCHAR(20) NOT NULL DEFAULT 'NEW'
                            CHECK (tds_regime IN ('NEW')),
    tds_standard_deduction  NUMERIC(10,2) NOT NULL,
    tds_cess_rate           NUMERIC(5,4) NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

-- ---------- TDS SLABS ----------
-- New-regime income tax brackets, versioned by financial year so a
-- Budget change is a new seed row set, not a code change.
CREATE TABLE tds_slabs (
    id              BIGSERIAL PRIMARY KEY,
    financial_year  VARCHAR(9) NOT NULL,   -- e.g. '2026-2027'
    slab_order      INT NOT NULL,
    from_amount     NUMERIC(12,2) NOT NULL,
    to_amount       NUMERIC(12,2),         -- NULL = no upper bound (top slab)
    rate            NUMERIC(5,4) NOT NULL,
    UNIQUE (financial_year, slab_order)
);

-- ---------- PROFESSIONAL TAX SLABS ----------
-- State-specific, versioned. Populated once the target state is
-- confirmed (see scoping doc §7, open decision #1).
CREATE TABLE professional_tax_slabs (
    id              BIGSERIAL PRIMARY KEY,
    state           VARCHAR(50) NOT NULL,
    from_amount     NUMERIC(10,2) NOT NULL,  -- monthly gross salary band
    to_amount       NUMERIC(10,2),
    monthly_amount  NUMERIC(6,2) NOT NULL,
    effective_from  DATE NOT NULL,
    effective_to    DATE,
    UNIQUE (state, from_amount, effective_from)
);

-- ---------- PAYSLIPS ----------
-- Frozen computed output. Never recalculated in place once generated —
-- a correction means re-running the payroll_run, which creates fresh rows.
CREATE TABLE payslips (
    id                      BIGSERIAL PRIMARY KEY,
    payroll_run_id          BIGINT NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
    employee_id             BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    salary_structure_id     BIGINT REFERENCES salary_structures(id) ON DELETE SET NULL,
    working_days            INT NOT NULL CHECK (working_days >= 0),
    paid_days               NUMERIC(4,1) NOT NULL CHECK (paid_days >= 0),
    gross_earnings          NUMERIC(10,2) NOT NULL,
    pf_employee             NUMERIC(10,2) NOT NULL DEFAULT 0,
    pf_employer             NUMERIC(10,2) NOT NULL DEFAULT 0,
    esi_employee            NUMERIC(10,2) NOT NULL DEFAULT 0,
    esi_employer            NUMERIC(10,2) NOT NULL DEFAULT 0,
    professional_tax        NUMERIC(10,2) NOT NULL DEFAULT 0,
    tds                     NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_deductions        NUMERIC(10,2) NOT NULL DEFAULT 0,
    net_pay                 NUMERIC(10,2) NOT NULL,
    pdf_path                VARCHAR(500),
    generated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (payroll_run_id, employee_id)
);

CREATE INDEX idx_payslips_employee_generated ON payslips(employee_id, generated_at DESC);

-- ---------- PAYSLIP EARNINGS (breakdown) ----------
CREATE TABLE payslip_earnings (
    id              BIGSERIAL PRIMARY KEY,
    payslip_id      BIGINT NOT NULL REFERENCES payslips(id) ON DELETE CASCADE,
    component_name  VARCHAR(50) NOT NULL,
    amount          NUMERIC(10,2) NOT NULL
);

CREATE INDEX idx_payslip_earnings_payslip ON payslip_earnings(payslip_id);

-- ============================================================
-- End of V5
-- ============================================================
