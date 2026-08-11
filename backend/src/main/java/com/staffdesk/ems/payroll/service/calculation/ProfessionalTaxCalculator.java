package com.staffdesk.ems.payroll.service.calculation;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Pure Professional Tax calculation logic. State-specific and slab-based, so this
 * class doesn't know about any particular state — it's handed the resolved slab
 * rows for the employee's {@code work_state} (see §4.5 / §7.1 open decision) and
 * picks the matching monthly amount.
 *
 * An empty/null slab list is treated as "this state doesn't levy PT" (or its slabs
 * haven't been seeded yet) and resolves to zero rather than throwing — PT is
 * explicitly not universal across states.
 */
public class ProfessionalTaxCalculator {

    private static final int SCALE = 2;

    /** Mirrors professional_tax_slabs (§4.5): monthly gross salary band -> flat monthly amount. */
    public record ProfessionalTaxSlab(
            BigDecimal fromAmount,
            BigDecimal toAmount,   // null = no upper bound (top slab)
            BigDecimal monthlyAmount
    ) {}

    public BigDecimal calculate(BigDecimal monthlyGrossSalary, List<ProfessionalTaxSlab> slabsForState) {
        if (monthlyGrossSalary == null || monthlyGrossSalary.signum() < 0) {
            throw new IllegalArgumentException("monthlyGrossSalary must be non-negative");
        }
        if (slabsForState == null || slabsForState.isEmpty()) {
            return zero();
        }

        for (ProfessionalTaxSlab slab : slabsForState) {
            boolean atOrAboveFrom = monthlyGrossSalary.compareTo(slab.fromAmount()) >= 0;
            boolean belowTo = slab.toAmount() == null || monthlyGrossSalary.compareTo(slab.toAmount()) < 0;
            if (atOrAboveFrom && belowTo) {
                return slab.monthlyAmount().setScale(SCALE, RoundingMode.HALF_UP);
            }
        }
        return zero();
    }

    private BigDecimal zero() {
        return BigDecimal.ZERO.setScale(SCALE, RoundingMode.HALF_UP);
    }
}
