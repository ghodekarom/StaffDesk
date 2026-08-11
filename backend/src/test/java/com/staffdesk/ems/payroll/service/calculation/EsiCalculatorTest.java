package com.staffdesk.ems.payroll.service.calculation;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class EsiCalculatorTest {

    private final EsiCalculator calculator = new EsiCalculator();

    private EsiCalculator.EsiRates standardRates() {
        return new EsiCalculator.EsiRates(
                new BigDecimal("0.0075"),
                new BigDecimal("0.0325"),
                new BigDecimal("21000.00"),
                new BigDecimal("25000.00")
        );
    }

    @Test
    void grossWithinCeiling_isApplicable() {
        EsiCalculator.EsiResult result = calculator.calculate(
                new BigDecimal("18000.00"), false, false, standardRates());

        assertTrue(result.applicable());
        assertEquals(new BigDecimal("135.00"), result.employeeContribution());
        assertEquals(new BigDecimal("585.00"), result.employerContribution());
    }

    @Test
    void grossAboveCeiling_notAlreadyContributing_isNotApplicable() {
        EsiCalculator.EsiResult result = calculator.calculate(
                new BigDecimal("22000.00"), false, false, standardRates());

        assertFalse(result.applicable());
        assertEquals(new BigDecimal("0.00"), result.employeeContribution());
        assertEquals(new BigDecimal("0.00"), result.employerContribution());
    }

    @Test
    void grossAboveCeiling_alreadyContributingThisPeriod_staysApplicable() {
        // ESI Act continuity rule: a mid-period raise doesn't drop coverage until the
        // next contribution period.
        EsiCalculator.EsiResult result = calculator.calculate(
                new BigDecimal("22000.00"), false, true, standardRates());

        assertTrue(result.applicable());
        assertEquals(new BigDecimal("165.00"), result.employeeContribution());
        assertEquals(new BigDecimal("715.00"), result.employerContribution());
    }

    @Test
    void disabilityCeiling_appliesHigherThreshold() {
        EsiCalculator.EsiResult result = calculator.calculate(
                new BigDecimal("23000.00"), true, false, standardRates());

        assertTrue(result.applicable());
    }
}
