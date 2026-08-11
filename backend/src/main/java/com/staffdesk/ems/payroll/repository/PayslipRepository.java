package com.staffdesk.ems.payroll.repository;

import com.staffdesk.ems.payroll.entity.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PayslipRepository extends JpaRepository<Payslip, Long> {

    Optional<Payslip> findByPayrollRunIdAndEmployeeId(Long payrollRunId, Long employeeId);

    List<Payslip> findByPayrollRunId(Long payrollRunId);

    /** Self-service history view, newest first — matches the (employee_id, generated_at DESC) index from §4.6. */
    List<Payslip> findByEmployeeIdOrderByGeneratedAtDesc(Long employeeId);

    /**
     * Was this employee ESI-applicable in any prior payslip within the given date
     * range? Used to implement the ESI Act continuity rule: once enrolled at the
     * start of a contribution period (Apr–Sep / Oct–Mar), coverage holds for the
     * rest of that period even if a raise later pushes wages over the ceiling.
     * Uses esi_employee > 0 as a proxy for "was applicable" — see PayrollRunService.
     */
    @Query(value = """
            SELECT COUNT(*) > 0 FROM payslips p
            JOIN payroll_runs r ON r.id = p.payroll_run_id
            WHERE p.employee_id = :employeeId
              AND p.esi_employee > 0
              AND make_date(r.period_year, r.period_month, 1) BETWEEN :periodStart AND :periodEnd
            """, nativeQuery = true)
    boolean existsEsiApplicablePriorInPeriod(@Param("employeeId") Long employeeId,
                                              @Param("periodStart") LocalDate periodStart,
                                              @Param("periodEnd") LocalDate periodEnd);
}
