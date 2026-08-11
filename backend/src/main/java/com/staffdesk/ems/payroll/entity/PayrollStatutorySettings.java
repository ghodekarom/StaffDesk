package com.staffdesk.ems.payroll.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Versioned compliance config — one row valid for a date range (§4.3).
 *
 * Extends the original §4.3 column set with the PF employer-side split
 * (EPS/EDLI/admin charge) and the TDS Section 87A rebate threshold/cap — both
 * flagged as schema gaps while building {@code PfCalculator} and {@code TdsCalculator}
 * in the previous build step, since neither of those figures had a home in the
 * doc's original table. See migration V6.
 *
 * NOTE: uses jakarta.persistence (Spring Boot 3.x). If this codebase is still on
 * Spring Boot 2.x / javax.persistence, swap the import package accordingly.
 */
@Entity
@Table(name = "payroll_statutory_settings")
public class PayrollStatutorySettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "pf_employee_rate", nullable = false)
    private BigDecimal pfEmployeeRate;

    @Column(name = "pf_employer_rate", nullable = false)
    private BigDecimal pfEmployerRate;

    @Column(name = "pf_wage_ceiling", nullable = false)
    private BigDecimal pfWageCeiling;

    @Column(name = "pf_eps_rate")
    private BigDecimal pfEpsRate;

    @Column(name = "pf_eps_ceiling")
    private BigDecimal pfEpsCeiling;

    @Column(name = "pf_edli_rate")
    private BigDecimal pfEdliRate;

    @Column(name = "pf_admin_charge_rate")
    private BigDecimal pfAdminChargeRate;

    @Column(name = "pf_admin_charge_minimum")
    private BigDecimal pfAdminChargeMinimum;

    @Column(name = "esi_employee_rate", nullable = false)
    private BigDecimal esiEmployeeRate;

    @Column(name = "esi_employer_rate", nullable = false)
    private BigDecimal esiEmployerRate;

    @Column(name = "esi_wage_ceiling", nullable = false)
    private BigDecimal esiWageCeiling;

    @Column(name = "tds_regime", nullable = false)
    private String tdsRegime;

    @Column(name = "tds_standard_deduction", nullable = false)
    private BigDecimal tdsStandardDeduction;

    @Column(name = "tds_cess_rate", nullable = false)
    private BigDecimal tdsCessRate;

    @Column(name = "tds_rebate_threshold")
    private BigDecimal tdsRebateThreshold;

    @Column(name = "tds_rebate_max_amount")
    private BigDecimal tdsRebateMaxAmount;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected PayrollStatutorySettings() {
        // JPA
    }

    public Long getId() {
        return id;
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

    public BigDecimal getPfEmployeeRate() {
        return pfEmployeeRate;
    }

    public void setPfEmployeeRate(BigDecimal pfEmployeeRate) {
        this.pfEmployeeRate = pfEmployeeRate;
    }

    public BigDecimal getPfEmployerRate() {
        return pfEmployerRate;
    }

    public void setPfEmployerRate(BigDecimal pfEmployerRate) {
        this.pfEmployerRate = pfEmployerRate;
    }

    public BigDecimal getPfWageCeiling() {
        return pfWageCeiling;
    }

    public void setPfWageCeiling(BigDecimal pfWageCeiling) {
        this.pfWageCeiling = pfWageCeiling;
    }

    public BigDecimal getPfEpsRate() {
        return pfEpsRate;
    }

    public void setPfEpsRate(BigDecimal pfEpsRate) {
        this.pfEpsRate = pfEpsRate;
    }

    public BigDecimal getPfEpsCeiling() {
        return pfEpsCeiling;
    }

    public void setPfEpsCeiling(BigDecimal pfEpsCeiling) {
        this.pfEpsCeiling = pfEpsCeiling;
    }

    public BigDecimal getPfEdliRate() {
        return pfEdliRate;
    }

    public void setPfEdliRate(BigDecimal pfEdliRate) {
        this.pfEdliRate = pfEdliRate;
    }

    public BigDecimal getPfAdminChargeRate() {
        return pfAdminChargeRate;
    }

    public void setPfAdminChargeRate(BigDecimal pfAdminChargeRate) {
        this.pfAdminChargeRate = pfAdminChargeRate;
    }

    public BigDecimal getPfAdminChargeMinimum() {
        return pfAdminChargeMinimum;
    }

    public void setPfAdminChargeMinimum(BigDecimal pfAdminChargeMinimum) {
        this.pfAdminChargeMinimum = pfAdminChargeMinimum;
    }

    public BigDecimal getEsiEmployeeRate() {
        return esiEmployeeRate;
    }

    public void setEsiEmployeeRate(BigDecimal esiEmployeeRate) {
        this.esiEmployeeRate = esiEmployeeRate;
    }

    public BigDecimal getEsiEmployerRate() {
        return esiEmployerRate;
    }

    public void setEsiEmployerRate(BigDecimal esiEmployerRate) {
        this.esiEmployerRate = esiEmployerRate;
    }

    public BigDecimal getEsiWageCeiling() {
        return esiWageCeiling;
    }

    public void setEsiWageCeiling(BigDecimal esiWageCeiling) {
        this.esiWageCeiling = esiWageCeiling;
    }

    public String getTdsRegime() {
        return tdsRegime;
    }

    public void setTdsRegime(String tdsRegime) {
        this.tdsRegime = tdsRegime;
    }

    public BigDecimal getTdsStandardDeduction() {
        return tdsStandardDeduction;
    }

    public void setTdsStandardDeduction(BigDecimal tdsStandardDeduction) {
        this.tdsStandardDeduction = tdsStandardDeduction;
    }

    public BigDecimal getTdsCessRate() {
        return tdsCessRate;
    }

    public void setTdsCessRate(BigDecimal tdsCessRate) {
        this.tdsCessRate = tdsCessRate;
    }

    public BigDecimal getTdsRebateThreshold() {
        return tdsRebateThreshold;
    }

    public void setTdsRebateThreshold(BigDecimal tdsRebateThreshold) {
        this.tdsRebateThreshold = tdsRebateThreshold;
    }

    public BigDecimal getTdsRebateMaxAmount() {
        return tdsRebateMaxAmount;
    }

    public void setTdsRebateMaxAmount(BigDecimal tdsRebateMaxAmount) {
        this.tdsRebateMaxAmount = tdsRebateMaxAmount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
