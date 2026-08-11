package com.staffdesk.ems.payroll.service.port;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Bridges to the attendance/leave modules. ASSUMPTION (open decision §7.3, not yet
 * resolved by the team): a day counts as LOP (loss of pay) if there's no
 * attendance row AND no approved paid leave for it — the simpler of the two options
 * in the scoping doc, since it doesn't require adding a paid/unpaid distinction to
 * leave_balances. Swap this assumption by changing the implementation, not
 * PayrollRunService.
 */
public interface AttendanceLeavePort {

    AttendancePeriodSummary summarize(Long employeeId, LocalDate periodStart, LocalDate periodEnd);

    record AttendancePeriodSummary(int workingDays, BigDecimal paidDays) {

        /** 1.0 when there's no LOP; 0 if workingDays is 0 (guards a divide-by-zero for edge-case periods). */
        public BigDecimal prorationFactor() {
            if (workingDays <= 0) {
                return BigDecimal.ZERO;
            }
            return paidDays.divide(BigDecimal.valueOf(workingDays), 10, java.math.RoundingMode.HALF_UP);
        }
    }
}
