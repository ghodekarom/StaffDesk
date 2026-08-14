package com.staffdesk.ems.payroll.service.port;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

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

    /**
     * Batch variant of {@link #findPayrollProfile(Long)} — added for 1.3 (search
     * payslips by employee name) so a run's worth of payslips can be name-resolved
     * in one round trip instead of one query per row. Missing/unknown ids are
     * simply absent from the returned map rather than throwing, since a payslip
     * referencing a since-deleted employee shouldn't break the whole list.
     */
    Map<Long, EmployeePayrollProfile> findPayrollProfiles(List<Long> employeeIds);

    record EmployeePayrollProfile(
            Long employeeId,
            String displayName,   // for the PDF header — adapt from wherever employee name lives today
            String workState,     // nullable until §7.1 is resolved
            boolean hasDisability,
            LocalDate dateOfJoining,
            LocalDate dateOfExit  // nullable if still active
    ) {}
}