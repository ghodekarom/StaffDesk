package com.staffdesk.ems.payroll.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Frozen computed output, one per employee per run (§4.6). employee_id and
 * salary_structure_id are cross-module FKs, kept as plain Longs (no @ManyToOne into
 * the employee/salary-structure modules, to avoid guessing at their entity shape).
 */
@Entity
@Table(name = "payslips")
public class Payslip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_run_id", nullable = false)
    private PayrollRun payrollRun;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "salary_structure_id")
    private Long salaryStructureId;

    @Column(name = "working_days", nullable = false)
    private Integer workingDays;

    @Column(name = "paid_days", nullable = false)
    private BigDecimal paidDays;

    @Column(name = "gross_earnings", nullable = false)
    private BigDecimal grossEarnings;

    @Column(name = "pf_employee", nullable = false)
    private BigDecimal pfEmployee;

    @Column(name = "pf_employer", nullable = false)
    private BigDecimal pfEmployer;

    @Column(name = "esi_employee", nullable = false)
    private BigDecimal esiEmployee = BigDecimal.ZERO;

    @Column(name = "esi_employer", nullable = false)
    private BigDecimal esiEmployer = BigDecimal.ZERO;

    @Column(name = "professional_tax", nullable = false)
    private BigDecimal professionalTax = BigDecimal.ZERO;

    @Column(name = "tds", nullable = false)
    private BigDecimal tds = BigDecimal.ZERO;

    @Column(name = "total_deductions", nullable = false)
    private BigDecimal totalDeductions;

    @Column(name = "net_pay", nullable = false)
    private BigDecimal netPay;

    @Column(name = "pdf_path")
    private String pdfPath;

    @Column(name = "generated_at", nullable = false)
    private Instant generatedAt;

    @OneToMany(mappedBy = "payslip", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PayslipEarning> earnings = new ArrayList<>();

    public Payslip() {
        // JPA
    }

    public Long getId() {
        return id;
    }

    public PayrollRun getPayrollRun() {
        return payrollRun;
    }

    public void setPayrollRun(PayrollRun payrollRun) {
        this.payrollRun = payrollRun;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getSalaryStructureId() {
        return salaryStructureId;
    }

    public void setSalaryStructureId(Long salaryStructureId) {
        this.salaryStructureId = salaryStructureId;
    }

    public Integer getWorkingDays() {
        return workingDays;
    }

    public void setWorkingDays(Integer workingDays) {
        this.workingDays = workingDays;
    }

    public BigDecimal getPaidDays() {
        return paidDays;
    }

    public void setPaidDays(BigDecimal paidDays) {
        this.paidDays = paidDays;
    }

    public BigDecimal getGrossEarnings() {
        return grossEarnings;
    }

    public void setGrossEarnings(BigDecimal grossEarnings) {
        this.grossEarnings = grossEarnings;
    }

    public BigDecimal getPfEmployee() {
        return pfEmployee;
    }

    public void setPfEmployee(BigDecimal pfEmployee) {
        this.pfEmployee = pfEmployee;
    }

    public BigDecimal getPfEmployer() {
        return pfEmployer;
    }

    public void setPfEmployer(BigDecimal pfEmployer) {
        this.pfEmployer = pfEmployer;
    }

    public BigDecimal getEsiEmployee() {
        return esiEmployee;
    }

    public void setEsiEmployee(BigDecimal esiEmployee) {
        this.esiEmployee = esiEmployee;
    }

    public BigDecimal getEsiEmployer() {
        return esiEmployer;
    }

    public void setEsiEmployer(BigDecimal esiEmployer) {
        this.esiEmployer = esiEmployer;
    }

    public BigDecimal getProfessionalTax() {
        return professionalTax;
    }

    public void setProfessionalTax(BigDecimal professionalTax) {
        this.professionalTax = professionalTax;
    }

    public BigDecimal getTds() {
        return tds;
    }

    public void setTds(BigDecimal tds) {
        this.tds = tds;
    }

    public BigDecimal getTotalDeductions() {
        return totalDeductions;
    }

    public void setTotalDeductions(BigDecimal totalDeductions) {
        this.totalDeductions = totalDeductions;
    }

    public BigDecimal getNetPay() {
        return netPay;
    }

    public void setNetPay(BigDecimal netPay) {
        this.netPay = netPay;
    }

    public String getPdfPath() {
        return pdfPath;
    }

    public void setPdfPath(String pdfPath) {
        this.pdfPath = pdfPath;
    }

    public Instant getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(Instant generatedAt) {
        this.generatedAt = generatedAt;
    }

    public List<PayslipEarning> getEarnings() {
        return earnings;
    }

    public void setEarnings(List<PayslipEarning> earnings) {
        this.earnings.clear();
        if (earnings != null) {
            earnings.forEach(e -> e.setPayslip(this));
            this.earnings.addAll(earnings);
        }
    }
}
