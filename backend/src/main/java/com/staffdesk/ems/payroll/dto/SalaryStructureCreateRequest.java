package com.staffdesk.ems.payroll.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class SalaryStructureCreateRequest {

    @NotNull(message = "Employee id is required")
    private Long employeeId;

    @NotNull(message = "Basic is required")
    @DecimalMin(value = "0", message = "Basic must not be negative")
    private BigDecimal basic;

    @DecimalMin(value = "0", message = "HRA must not be negative")
    private BigDecimal hra = BigDecimal.ZERO;

    @DecimalMin(value = "0", message = "Conveyance allowance must not be negative")
    private BigDecimal conveyanceAllowance = BigDecimal.ZERO;

    @DecimalMin(value = "0", message = "Special allowance must not be negative")
    private BigDecimal specialAllowance = BigDecimal.ZERO;

    @DecimalMin(value = "0", message = "Other allowance must not be negative")
    private BigDecimal otherAllowance = BigDecimal.ZERO;

    @NotNull(message = "Annual CTC is required")
    @DecimalMin(value = "0", message = "Annual CTC must not be negative")
    private BigDecimal ctcAnnual;

    @NotNull(message = "Effective-from date is required")
    private LocalDate effectiveFrom;

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
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
}
