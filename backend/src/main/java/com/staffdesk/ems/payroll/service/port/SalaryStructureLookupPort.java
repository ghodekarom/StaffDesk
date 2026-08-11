package com.staffdesk.ems.payroll.service.port;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * PayrollRunService needs an employee's salary structure but shouldn't guess at the
 * exact shape of the SalaryStructureRepository/Service built in step 2 (build order
 * item 2). Implement this against whatever that already exposes — e.g. a thin
 * adapter calling SalaryStructureService.getCurrent(employeeId, asOfDate) and
 * mapping the result into a SalaryStructureSnapshot.
 */
public interface SalaryStructureLookupPort {

    Optional<SalaryStructureSnapshot> findApplicable(Long employeeId, java.time.LocalDate periodDate);

    /**
     * Flat snapshot of the components PayrollRunService needs. DA is deliberately
     * absent — salary_structures (§4.1) has no da column, so PF is computed on
     * Basic alone here. If your salary structures do carry a DA component under a
     * different name, map it in and extend this record (and PfCalculator's caller)
     * accordingly.
     */
    record SalaryStructureSnapshot(
            Long salaryStructureId,
            BigDecimal basic,
            BigDecimal hra,
            BigDecimal conveyanceAllowance,
            BigDecimal specialAllowance,
            BigDecimal otherAllowance
    ) {
        public BigDecimal grossMonthly() {
            return basic.add(hra).add(conveyanceAllowance).add(specialAllowance).add(otherAllowance);
        }
    }
}
