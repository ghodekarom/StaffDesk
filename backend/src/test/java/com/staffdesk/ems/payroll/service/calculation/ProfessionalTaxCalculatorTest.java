package com.staffdesk.ems.payroll.service.calculation;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ProfessionalTaxCalculatorTest {

    private final ProfessionalTaxCalculator calculator = new ProfessionalTaxCalculator();

    // Illustrative slab shape only — NOT verified against a real state's current
    // notification. §7.1 is still open on which state to seed; verify the real
    // figures before using this in any actual payroll run.
    private List<ProfessionalTaxCalculator.ProfessionalTaxSlab> illustrativeSlabs() {
        return List.of(
                new ProfessionalTaxCalculator.ProfessionalTaxSlab(
                        BigDecimal.ZERO, new BigDecimal("7500.00"), BigDecimal.ZERO),
                new ProfessionalTaxCalculator.ProfessionalTaxSlab(
                        new BigDecimal("7500.00"), new BigDecimal("10000.00"), new BigDecimal("175.00")),
                new ProfessionalTaxCalculator.ProfessionalTaxSlab(
                        new BigDecimal("10000.00"), null, new BigDecimal("200.00"))
        );
    }

    @Test
    void belowFirstSlab_isZero() {
        BigDecimal result = calculator.calculate(new BigDecimal("6000.00"), illustrativeSlabs());
        assertEquals(new BigDecimal("0.00"), result);
    }

    @Test
    void middleSlab_matchesBand() {
        BigDecimal result = calculator.calculate(new BigDecimal("9000.00"), illustrativeSlabs());
        assertEquals(new BigDecimal("175.00"), result);
    }

    @Test
    void topOpenEndedSlab_matches() {
        BigDecimal result = calculator.calculate(new BigDecimal("50000.00"), illustrativeSlabs());
        assertEquals(new BigDecimal("200.00"), result);
    }

    @Test
    void noSlabsSeeded_treatedAsStateNotLevyingTax() {
        BigDecimal result = calculator.calculate(new BigDecimal("50000.00"), List.of());
        assertEquals(new BigDecimal("0.00"), result);
    }
}
