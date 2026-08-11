package com.staffdesk.ems.payroll.service.port;

import java.time.LocalDate;
import java.util.List;

/**
 * Bridges to the employee module. NOTE: workState maps to employees.work_state,
 * which doesn't exist yet (§7.1 — open decision). Until that column is added,
 * implementations should return null for it; PayrollRunService treats a null
 * work state as "no Professional Tax applied" and logs a warning, rather than
 * failing the whole run.
 */
public interface EmployeeDirectoryPort {

    /** Employees who should be included in a run for the given period (e.g. active, or active-during-period for joiners/leavers). */
    List<Long> findActiveEmployeeIds(LocalDate periodDate);

    EmployeePayrollProfile findPayrollProfile(Long employeeId);

    record EmployeePayrollProfile(
            Long employeeId,
            String workState,     // nullable until §7.1 is resolved
            boolean hasDisability,
            LocalDate dateOfJoining,
            LocalDate dateOfExit  // nullable if still active
    ) {}
}
