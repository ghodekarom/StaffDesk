package com.staffdesk.ems.payroll.entity;

import com.staffdesk.ems.employee.entity.Employee;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "salary_structures")
public class SalaryStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal basic;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal hra = BigDecimal.ZERO;

    @Column(name = "conveyance_allowance", nullable = false, precision = 10, scale = 2)
    private BigDecimal conveyanceAllowance = BigDecimal.ZERO;

    @Column(name = "special_allowance", nullable = false, precision = 10, scale = 2)
    private BigDecimal specialAllowance = BigDecimal.ZERO;

    @Column(name = "other_allowance", nullable = false, precision = 10, scale = 2)
    private BigDecimal otherAllowance = BigDecimal.ZERO;

    @Column(name = "ctc_annual", nullable = false, precision = 12, scale = 2)
    private BigDecimal ctcAnnual;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    // NULL = this is the employee's currently active structure.
    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private Employee createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    /** Sum of all monthly earning components (does not include employer-side PF/ESI cost). */
    public BigDecimal monthlyGross() {
        return basic.add(hra).add(conveyanceAllowance).add(specialAllowance).add(otherAllowance);
    }

    public Long getId() {
        return id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public BigDecimal getBasic() {
        return basic;
    }

    public void setBasic(BigDecimal basic) {
        this.basic = basic;
    }

    public BigDecimal getHra() {
        return hra;
    }

    public void setHra(BigDecimal hra) {
        this.hra = hra;
    }

    public BigDecimal getConveyanceAllowance() {
        return conveyanceAllowance;
    }

    public void setConveyanceAllowance(BigDecimal conveyanceAllowance) {
        this.conveyanceAllowance = conveyanceAllowance;
    }

    public BigDecimal getSpecialAllowance() {
        return specialAllowance;
    }

    public void setSpecialAllowance(BigDecimal specialAllowance) {
        this.specialAllowance = specialAllowance;
    }

    public BigDecimal getOtherAllowance() {
        return otherAllowance;
    }

    public void setOtherAllowance(BigDecimal otherAllowance) {
        this.otherAllowance = otherAllowance;
    }

    public BigDecimal getCtcAnnual() {
        return ctcAnnual;
    }

    public void setCtcAnnual(BigDecimal ctcAnnual) {
        this.ctcAnnual = ctcAnnual;
    }

    public LocalDate getEffectiveFrom() {
        return effectiveFrom;
    }

    public void setEffectiveFrom(LocalDate effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }

    public LocalDate getEffectiveTo() {
        return effectiveTo;
    }

    public void setEffectiveTo(LocalDate effectiveTo) {
        this.effectiveTo = effectiveTo;
    }

    public Employee getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Employee createdBy) {
        this.createdBy = createdBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
