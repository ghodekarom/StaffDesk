package com.staffdesk.ems.payroll.service.calculation;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Pure ESI (Employees' State Insurance) calculation logic. See {@link PfCalculator}
 * for the design rationale (no entity/repository access, rates injected by the caller).
 *
 * IMPORTANT DOMAIN RULE (not yet reflected in §7 open decisions — worth adding):
 * under the ESI Act, an employee who is enrolled at the *start* of a contribution
 * period (Apr–Sep or Oct–Mar) stays ESI-applicable for the rest of that period even
 * if a mid-period raise pushes gross wages above the ceiling. This calculator can't
 * know that on its own — the caller (PayrollRunService) must track and pass
 * {@code alreadyContributingThisPeriod}.
 */
public class EsiCalculator {

    private static final int SCALE = 2;

    public record EsiRates(
            BigDecimal employeeRate,          // e.g. 0.0075 (0.75%)
            BigDecimal employerRate,          // e.g. 0.0325 (3.25%)
            BigDecimal wageCeiling,           // e.g. 21000.00
            BigDecimal disabilityWageCeiling  // e.g. 25000.00
    ) {}

    public record EsiResult(
            boolean applicable,
            BigDecimal employeeContribution,
            BigDecimal employerContribution
    ) {}

    public EsiResult calculate(BigDecimal grossWages,
                                boolean employeeHasDisability,
                                boolean alreadyContributingThisPeriod,
                                EsiRates rates) {
        if (grossWages == null || grossWages.signum() < 0) {
            throw new IllegalArgumentException("grossWages must be non-negative");
        }

        BigDecimal ceiling = employeeHasDisability ? rates.disabilityWageCeiling() : rates.wageCeiling();
        boolean withinCeiling = grossWages.compareTo(ceiling) <= 0;

        if (!withinCeiling && !alreadyContributingThisPeriod) {
            return new EsiResult(false, zero(), zero());
        }

        BigDecimal employee = round(grossWages.multiply(rates.employeeRate()));
        BigDecimal employer = round(grossWages.multiply(rates.employerRate()));
        return new EsiResult(true, employee, employer);
    }

    private BigDecimal zero() {
        return BigDecimal.ZERO.setScale(SCALE, RoundingMode.HALF_UP);
    }

    private BigDecimal round(BigDecimal value) {
        return value.setScale(SCALE, RoundingMode.HALF_UP);
    }
}
