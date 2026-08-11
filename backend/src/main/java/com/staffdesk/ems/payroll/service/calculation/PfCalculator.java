package com.staffdesk.ems.payroll.service.calculation;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Pure EPF (Employees' Provident Fund) calculation logic.
 *
 * No entity/repository access — takes plain values in, returns plain values out,
 * so it can be unit-tested against worked examples without a Spring context.
 *
 * Rates are never hardcoded here: callers must supply a {@link PfRates} resolved
 * from the {@code payroll_statutory_settings} row that covers the payroll period
 * (see §4.3 of the Payroll Phase 2 scoping doc), since these figures change by
 * government notification, not by app release.
 *
 * NOTE ON SCOPE: the {@code payroll_statutory_settings} table as currently scoped
 * (§4.3) only stores {@code pf_employee_rate} / {@code pf_employer_rate} /
 * {@code pf_wage_ceiling}. The employer-side split into EPS / EPF / EDLI / admin
 * charge (needed for statutory reporting, not employee-visible deductions) needs
 * its own columns or a sibling settings row — flagged here as a schema gap to
 * resolve before wiring this into PayrollRunService.
 */
public class PfCalculator {

    private static final int SCALE = 2;

    /** Rates resolved from payroll_statutory_settings (+ the EPS/EDLI/admin split noted above). */
    public record PfRates(
            BigDecimal employeeRate,       // e.g. 0.1200 (12%)
            BigDecimal employerRate,       // e.g. 0.1200 (12%) — split into EPS + EPF below
            BigDecimal wageCeiling,        // e.g. 15000.00 — statutory PF wage ceiling
            BigDecimal epsRate,            // e.g. 0.0833 (8.33%), part of employerRate
            BigDecimal epsCeiling,         // e.g. 1250.00 — max EPS contribution/month
            BigDecimal edliRate,           // e.g. 0.0050 — pure employer cost, not employee-visible
            BigDecimal adminChargeRate,    // e.g. 0.0050 — pure employer cost, not employee-visible
            BigDecimal adminChargeMinimum  // e.g. 500.00 — statutory minimum admin charge
    ) {}

    /** All figures rounded to 2 decimal places to match the payslips.* NUMERIC(10,2) columns. */
    public record PfResult(
            BigDecimal wageBase,            // basic+DA capped at wageCeiling
            BigDecimal employeeContribution,
            BigDecimal employerEps,
            BigDecimal employerEpf,
            BigDecimal employerEdli,
            BigDecimal employerAdminCharge,
            BigDecimal employerTotalCost    // eps + epf + edli + admin — full employer cost
    ) {}

    public PfResult calculate(BigDecimal basicPlusDa, PfRates rates) {
        if (basicPlusDa == null || basicPlusDa.signum() < 0) {
            throw new IllegalArgumentException("basicPlusDa must be non-negative");
        }

        BigDecimal wageBase = basicPlusDa.min(rates.wageCeiling());

        BigDecimal employeeContribution = round(wageBase.multiply(rates.employeeRate()));
        BigDecimal employerTotal = round(wageBase.multiply(rates.employerRate()));

        BigDecimal employerEps = round(wageBase.multiply(rates.epsRate())).min(rates.epsCeiling());
        BigDecimal employerEpf = employerTotal.subtract(employerEps).max(BigDecimal.ZERO);

        BigDecimal employerEdli = round(wageBase.multiply(rates.edliRate()));
        BigDecimal employerAdminCharge = round(wageBase.multiply(rates.adminChargeRate()))
                .max(rates.adminChargeMinimum());

        BigDecimal employerTotalCost = employerEps.add(employerEpf).add(employerEdli).add(employerAdminCharge);

        return new PfResult(wageBase, employeeContribution, employerEps, employerEpf,
                employerEdli, employerAdminCharge, employerTotalCost);
    }

    private BigDecimal round(BigDecimal value) {
        return value.setScale(SCALE, RoundingMode.HALF_UP);
    }
}
