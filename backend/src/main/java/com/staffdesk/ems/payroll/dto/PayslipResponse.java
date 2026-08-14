package com.staffdesk.ems.payroll.dto;

import com.staffdesk.ems.payroll.entity.Payslip;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Entity-derived response, using a static from() factory to match the existing
 * LeaveBalanceResponse convention referenced in §5 (rather than a plain record,
 * since it composes a nested list mapped from a child entity).
 */
public class PayslipResponse {

    private final Long id;
    private final Long payrollRunId;
    private final Long employeeId;
    private final String employeeName;
    private final Integer periodMonth;
    private final Integer periodYear;
    private final Integer workingDays;
    private final BigDecimal paidDays;
    private final BigDecimal grossEarnings;
    private final BigDecimal pfEmployee;
    private final BigDecimal pfEmployer;
    private final BigDecimal esiEmployee;
    private final BigDecimal esiEmployer;
    private final BigDecimal professionalTax;
    private final BigDecimal tds;
    private final BigDecimal totalDeductions;
    private final BigDecimal netPay;
    private final boolean pdfAvailable;
    private final Instant generatedAt;
    private final List<PayslipEarningResponse> earnings;

    private PayslipResponse(Long id, Long payrollRunId, Long employeeId, String employeeName,
                            Integer periodMonth, Integer periodYear,
                            Integer workingDays, BigDecimal paidDays, BigDecimal grossEarnings,
                            BigDecimal pfEmployee, BigDecimal pfEmployer, BigDecimal esiEmployee,
                            BigDecimal esiEmployer, BigDecimal professionalTax, BigDecimal tds,
                            BigDecimal totalDeductions, BigDecimal netPay, boolean pdfAvailable,
                            Instant generatedAt, List<PayslipEarningResponse> earnings) {
        this.id = id;
        this.payrollRunId = payrollRunId;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.periodMonth = periodMonth;
        this.periodYear = periodYear;
        this.workingDays = workingDays;
        this.paidDays = paidDays;
        this.grossEarnings = grossEarnings;
        this.pfEmployee = pfEmployee;
        this.pfEmployer = pfEmployer;
        this.esiEmployee = esiEmployee;
        this.esiEmployer = esiEmployer;
        this.professionalTax = professionalTax;
        this.tds = tds;
        this.totalDeductions = totalDeductions;
        this.netPay = netPay;
        this.pdfAvailable = pdfAvailable;
        this.generatedAt = generatedAt;
        this.earnings = earnings;
    }

    /**
     * @param employeeName resolved by the caller via EmployeeDirectoryPort (batched
     *                      for list endpoints — see 1.3) — not derivable from the
     *                      Payslip entity alone, which only stores employeeId.
     *                      Pass "Employee #<id>" (or similar) as a fallback if the
     *                      employee directory has no matching row.
     */
    public static PayslipResponse from(Payslip p, String employeeName) {
        List<PayslipEarningResponse> earnings = p.getEarnings().stream()
                .map(PayslipEarningResponse::from)
                .toList();

        return new PayslipResponse(
                p.getId(),
                p.getPayrollRun().getId(),
                p.getEmployeeId(),
                employeeName,
                p.getPayrollRun().getPeriodMonth(),
                p.getPayrollRun().getPeriodYear(),
                p.getWorkingDays(),
                p.getPaidDays(),
                p.getGrossEarnings(),
                p.getPfEmployee(),
                p.getPfEmployer(),
                p.getEsiEmployee(),
                p.getEsiEmployer(),
                p.getProfessionalTax(),
                p.getTds(),
                p.getTotalDeductions(),
                p.getNetPay(),
                p.getPdfPath() != null,   // don't leak the raw storage path/key
                p.getGeneratedAt(),
                earnings
        );
    }

    public Long getId() {
        return id;
    }

    public Long getPayrollRunId() {
        return payrollRunId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public Integer getPeriodMonth() {
        return periodMonth;
    }

    public Integer getPeriodYear() {
        return periodYear;
    }

    public Integer getWorkingDays() {
        return workingDays;
    }

    public BigDecimal getPaidDays() {
        return paidDays;
    }

    public BigDecimal getGrossEarnings() {
        return grossEarnings;
    }

    public BigDecimal getPfEmployee() {
        return pfEmployee;
    }

    public BigDecimal getPfEmployer() {
        return pfEmployer;
    }

    public BigDecimal getEsiEmployee() {
        return esiEmployee;
    }

    public BigDecimal getEsiEmployer() {
        return esiEmployer;
    }

    public BigDecimal getProfessionalTax() {
        return professionalTax;
    }

    public BigDecimal getTds() {
        return tds;
    }

    public BigDecimal getTotalDeductions() {
        return totalDeductions;
    }

    public BigDecimal getNetPay() {
        return netPay;
    }

    public boolean isPdfAvailable() {
        return pdfAvailable;
    }

    public Instant getGeneratedAt() {
        return generatedAt;
    }

    public List<PayslipEarningResponse> getEarnings() {
        return earnings;
    }
}