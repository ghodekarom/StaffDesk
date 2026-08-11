package com.staffdesk.ems.payroll.dto;

import com.staffdesk.ems.payroll.entity.SalaryStructure;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public class SalaryStructureResponse {

    private final Long id;
    private final Long employeeId;
    private final BigDecimal basic;
    private final BigDecimal hra;
    private final BigDecimal conveyanceAllowance;
    private final BigDecimal specialAllowance;
    private final BigDecimal otherAllowance;
    private final BigDecimal monthlyGross;
    private final BigDecimal ctcAnnual;
    private final LocalDate effectiveFrom;
    private final LocalDate effectiveTo;
    private final Long createdById;
    private final Instant createdAt;

    public SalaryStructureResponse(Long id, Long employeeId, BigDecimal basic, BigDecimal hra,
                                    BigDecimal conveyanceAllowance, BigDecimal specialAllowance,
                                    BigDecimal otherAllowance, BigDecimal monthlyGross, BigDecimal ctcAnnual,
                                    LocalDate effectiveFrom, LocalDate effectiveTo, Long createdById,
                                    Instant createdAt) {
        this.id = id;
        this.employeeId = employeeId;
        this.basic = basic;
        this.hra = hra;
        this.conveyanceAllowance = conveyanceAllowance;
        this.specialAllowance = specialAllowance;
        this.otherAllowance = otherAllowance;
        this.monthlyGross = monthlyGross;
        this.ctcAnnual = ctcAnnual;
        this.effectiveFrom = effectiveFrom;
        this.effectiveTo = effectiveTo;
        this.createdById = createdById;
        this.createdAt = createdAt;
    }

    public static SalaryStructureResponse from(SalaryStructure s) {
        return new SalaryStructureResponse(
                s.getId(),
                s.getEmployee().getId(),
                s.getBasic(),
                s.getHra(),
                s.getConveyanceAllowance(),
                s.getSpecialAllowance(),
                s.getOtherAllowance(),
                s.monthlyGross(),
                s.getCtcAnnual(),
                s.getEffectiveFrom(),
                s.getEffectiveTo(),
                s.getCreatedBy() != null ? s.getCreatedBy().getId() : null,
                s.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public BigDecimal getBasic() {
        return basic;
    }

    public BigDecimal getHra() {
        return hra;
    }

    public BigDecimal getConveyanceAllowance() {
        return conveyanceAllowance;
    }

    public BigDecimal getSpecialAllowance() {
        return specialAllowance;
    }

    public BigDecimal getOtherAllowance() {
        return otherAllowance;
    }

    public BigDecimal getMonthlyGross() {
        return monthlyGross;
    }

    public BigDecimal getCtcAnnual() {
        return ctcAnnual;
    }

    public LocalDate getEffectiveFrom() {
        return effectiveFrom;
    }

    public LocalDate getEffectiveTo() {
        return effectiveTo;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
