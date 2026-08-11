package com.staffdesk.ems.payroll.service.calculation;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

/**
 * Pure TDS (new regime only, per §3 out-of-scope decision) calculation logic.
 *
 * Slabs, standard deduction and cess rate are all injected — none hardcoded — since
 * these are Budget-dependent and versioned by financial year (tds_slabs, §4.4).
 *
 * The Section 87A rebate threshold/cap is genuinely unstable across Budgets and has
 * no dedicated column in the current §4.3/§4.4 schema; it's modeled here as its own
 * {@link TdsRebateRule} input so it stays out of Java constants too — but note this
 * is a schema gap worth raising alongside §7 (likely lives on
 * payroll_statutory_settings as two more columns).
 *
 * {@code remainingMonthsInFinancialYear} lets a caller prorate a new joiner's
 * annual tax liability over fewer months (touches open decision §7.5) instead of
 * always dividing by 12.
 */
public class TdsCalculator {

    private static final int SCALE = 2;

    /** Mirrors tds_slabs (§4.4), evaluated in slabOrder sequence. */
    public record TdsSlab(int slabOrder, BigDecimal fromAmount, BigDecimal toAmount, BigDecimal rate) {}

    public record TdsRebateRule(BigDecimal taxableIncomeThreshold, BigDecimal maxRebateAmount) {}

    public record TdsResult(
            BigDecimal annualTaxableIncome,
            BigDecimal annualTaxBeforeRebate,
            BigDecimal rebateApplied,
            BigDecimal annualTaxAfterRebate,
            BigDecimal cess,
            BigDecimal annualTaxPayable,
            BigDecimal monthlyTds
    ) {}

    public TdsResult calculate(BigDecimal annualGrossSalary,
                                BigDecimal standardDeduction,
                                List<TdsSlab> slabs,
                                TdsRebateRule rebateRule,
                                BigDecimal cessRate,
                                int remainingMonthsInFinancialYear) {
        if (annualGrossSalary == null || annualGrossSalary.signum() < 0) {
            throw new IllegalArgumentException("annualGrossSalary must be non-negative");
        }

        BigDecimal taxableIncome = annualGrossSalary.subtract(standardDeduction).max(BigDecimal.ZERO);
        BigDecimal taxBeforeRebate = computeSlabTax(taxableIncome, slabs);

        BigDecimal rebate = BigDecimal.ZERO;
        if (rebateRule != null && taxableIncome.compareTo(rebateRule.taxableIncomeThreshold()) <= 0) {
            rebate = taxBeforeRebate.min(rebateRule.maxRebateAmount());
        }
        BigDecimal taxAfterRebate = taxBeforeRebate.subtract(rebate).max(BigDecimal.ZERO);

        BigDecimal cess = round(taxAfterRebate.multiply(cessRate));
        BigDecimal taxPayable = taxAfterRebate.add(cess);

        int divisor = remainingMonthsInFinancialYear > 0 ? remainingMonthsInFinancialYear : 12;
        BigDecimal monthlyTds = taxPayable.divide(BigDecimal.valueOf(divisor), SCALE, RoundingMode.HALF_UP);

        return new TdsResult(
                round(taxableIncome),
                round(taxBeforeRebate),
                round(rebate),
                round(taxAfterRebate),
                cess,
                round(taxPayable),
                monthlyTds
        );
    }

    /** Cumulative slab tax: each slab taxes only the band of income that falls within it. */
    private BigDecimal computeSlabTax(BigDecimal taxableIncome, List<TdsSlab> slabs) {
        BigDecimal tax = BigDecimal.ZERO;
        List<TdsSlab> ordered = slabs.stream()
                .sorted(Comparator.comparingInt(TdsSlab::slabOrder))
                .toList();

        for (TdsSlab slab : ordered) {
            if (taxableIncome.compareTo(slab.fromAmount()) <= 0) {
                continue;
            }
            BigDecimal bandTop = slab.toAmount() != null ? taxableIncome.min(slab.toAmount()) : taxableIncome;
            BigDecimal bandAmount = bandTop.subtract(slab.fromAmount());
            if (bandAmount.signum() > 0) {
                tax = tax.add(bandAmount.multiply(slab.rate()));
            }
        }
        return tax;
    }

    private BigDecimal round(BigDecimal value) {
        return value.setScale(SCALE, RoundingMode.HALF_UP);
    }
}
