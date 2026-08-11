package com.staffdesk.ems.payroll.service.calculation;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TdsCalculatorTest {

    private final TdsCalculator calculator = new TdsCalculator();

    // FY2026-27 new-regime slabs from the scoping doc §2.
    private List<TdsCalculator.TdsSlab> fy2026_27Slabs() {
        return List.of(
                new TdsCalculator.TdsSlab(1, new BigDecimal("0"), new BigDecimal("400000"), new BigDecimal("0.00")),
                new TdsCalculator.TdsSlab(2, new BigDecimal("400000"), new BigDecimal("800000"), new BigDecimal("0.05")),
                new TdsCalculator.TdsSlab(3, new BigDecimal("800000"), new BigDecimal("1200000"), new BigDecimal("0.10")),
                new TdsCalculator.TdsSlab(4, new BigDecimal("1200000"), new BigDecimal("1600000"), new BigDecimal("0.15")),
                new TdsCalculator.TdsSlab(5, new BigDecimal("1600000"), new BigDecimal("2000000"), new BigDecimal("0.20")),
                new TdsCalculator.TdsSlab(6, new BigDecimal("2000000"), new BigDecimal("2400000"), new BigDecimal("0.25")),
                new TdsCalculator.TdsSlab(7, new BigDecimal("2400000"), null, new BigDecimal("0.30"))
        );
    }

    private static final BigDecimal STANDARD_DEDUCTION = new BigDecimal("75000.00");
    private static final BigDecimal CESS_RATE = new BigDecimal("0.0400");

    // Illustrative 87A rebate rule — the actual threshold/cap is Budget-dependent and
    // NOT confirmed against a current CBDT circular; verify before real use (see §2).
    private final TdsCalculator.TdsRebateRule rebateRule =
            new TdsCalculator.TdsRebateRule(new BigDecimal("1200000.00"), new BigDecimal("60000.00"));

    @Test
    void incomeWithinRebateThreshold_taxFullyRebated() {
        TdsCalculator.TdsResult result = calculator.calculate(
                new BigDecimal("1000000.00"), STANDARD_DEDUCTION, fy2026_27Slabs(), rebateRule, CESS_RATE, 12);

        assertEquals(new BigDecimal("925000.00"), result.annualTaxableIncome());
        assertEquals(new BigDecimal("32500.00"), result.annualTaxBeforeRebate());
        assertEquals(new BigDecimal("32500.00"), result.rebateApplied());
        assertEquals(new BigDecimal("0.00"), result.annualTaxAfterRebate());
        assertEquals(new BigDecimal("0.00"), result.cess());
        assertEquals(new BigDecimal("0.00"), result.annualTaxPayable());
        assertEquals(new BigDecimal("0.00"), result.monthlyTds());
    }

    @Test
    void incomeAboveRebateThreshold_taxAndCessApply() {
        TdsCalculator.TdsResult result = calculator.calculate(
                new BigDecimal("2000000.00"), STANDARD_DEDUCTION, fy2026_27Slabs(), rebateRule, CESS_RATE, 12);

        assertEquals(new BigDecimal("1925000.00"), result.annualTaxableIncome());
        assertEquals(new BigDecimal("185000.00"), result.annualTaxBeforeRebate());
        assertEquals(new BigDecimal("0.00"), result.rebateApplied());
        assertEquals(new BigDecimal("185000.00"), result.annualTaxAfterRebate());
        assertEquals(new BigDecimal("7400.00"), result.cess());
        assertEquals(new BigDecimal("192400.00"), result.annualTaxPayable());
        assertEquals(new BigDecimal("16033.33"), result.monthlyTds());
    }

    @Test
    void midYearJoiner_proratesOverRemainingMonths() {
        // Same annual liability as the test above, but joining with only 6 months
        // left in the financial year (touches open decision §7.5).
        TdsCalculator.TdsResult result = calculator.calculate(
                new BigDecimal("2000000.00"), STANDARD_DEDUCTION, fy2026_27Slabs(), rebateRule, CESS_RATE, 6);

        assertEquals(new BigDecimal("192400.00"), result.annualTaxPayable());
        assertEquals(new BigDecimal("32066.67"), result.monthlyTds());
    }

    @Test
    void zeroIncome_producesNoTax() {
        TdsCalculator.TdsResult result = calculator.calculate(
                BigDecimal.ZERO, STANDARD_DEDUCTION, fy2026_27Slabs(), rebateRule, CESS_RATE, 12);

        assertEquals(new BigDecimal("0.00"), result.annualTaxPayable());
    }
}
