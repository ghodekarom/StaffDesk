package com.staffdesk.ems.payroll.service.calculation;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PfCalculatorTest {

    private final PfCalculator calculator = new PfCalculator();

    private PfCalculator.PfRates standardRates() {
        return new PfCalculator.PfRates(
                new BigDecimal("0.1200"),
                new BigDecimal("0.1200"),
                new BigDecimal("15000.00"),
                new BigDecimal("0.0833"),
                new BigDecimal("1250.00"),
                new BigDecimal("0.0050"),
                new BigDecimal("0.0050"),
                new BigDecimal("500.00")
        );
    }

    @Test
    void wageAboveCeiling_capsAtWageCeiling() {
        // Worked example from the scoping doc §2: ₹32,000 basic -> PF capped at ₹1,800 employee side.
        PfCalculator.PfResult result = calculator.calculate(new BigDecimal("32000.00"), standardRates());

        assertEquals(new BigDecimal("15000.00"), result.wageBase());
        assertEquals(new BigDecimal("1800.00"), result.employeeContribution());
        assertEquals(new BigDecimal("1249.50"), result.employerEps());
        assertEquals(new BigDecimal("550.50"), result.employerEpf());
        assertEquals(new BigDecimal("75.00"), result.employerEdli());
        // 0.5% of 15000 = 75.00, below the ₹500 statutory minimum admin charge.
        assertEquals(new BigDecimal("500.00"), result.employerAdminCharge());
        assertEquals(new BigDecimal("2375.00"), result.employerTotalCost());
    }

    @Test
    void wageBelowCeiling_usesActualWage() {
        PfCalculator.PfResult result = calculator.calculate(new BigDecimal("10000.00"), standardRates());

        assertEquals(new BigDecimal("10000.00"), result.wageBase());
        assertEquals(new BigDecimal("1200.00"), result.employeeContribution());
    }

    @Test
    void zeroBasic_producesZeroContributions() {
        PfCalculator.PfResult result = calculator.calculate(BigDecimal.ZERO, standardRates());

        assertEquals(new BigDecimal("0.00"), result.employeeContribution());
        // Admin charge minimum still applies even at zero wage base, per the statutory floor.
        assertEquals(new BigDecimal("500.00"), result.employerAdminCharge());
    }

    @Test
    void negativeBasic_throws() {
        org.junit.jupiter.api.Assertions.assertThrows(IllegalArgumentException.class,
                () -> calculator.calculate(new BigDecimal("-100.00"), standardRates()));
    }
}
