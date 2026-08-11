package com.staffdesk.ems.payroll.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

/**
 * New-regime tax brackets, versioned by financial year (§4.4). Seeded via Flyway
 * per financial year — a new Budget means a new seed row set, not a redeploy.
 */
@Entity
@Table(name = "tds_slabs")
public class TdsSlab {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "financial_year", nullable = false)
    private String financialYear;

    @Column(name = "slab_order", nullable = false)
    private Integer slabOrder;

    @Column(name = "from_amount", nullable = false)
    private BigDecimal fromAmount;

    @Column(name = "to_amount")
    private BigDecimal toAmount;

    @Column(name = "rate", nullable = false)
    private BigDecimal rate;

    protected TdsSlab() {
        // JPA
    }

    public Long getId() {
        return id;
    }

    public String getFinancialYear() {
        return financialYear;
    }

    public void setFinancialYear(String financialYear) {
        this.financialYear = financialYear;
    }

    public Integer getSlabOrder() {
        return slabOrder;
    }

    public void setSlabOrder(Integer slabOrder) {
        this.slabOrder = slabOrder;
    }

    public BigDecimal getFromAmount() {
        return fromAmount;
    }

    public void setFromAmount(BigDecimal fromAmount) {
        this.fromAmount = fromAmount;
    }

    public BigDecimal getToAmount() {
        return toAmount;
    }

    public void setToAmount(BigDecimal toAmount) {
        this.toAmount = toAmount;
    }

    public BigDecimal getRate() {
        return rate;
    }

    public void setRate(BigDecimal rate) {
        this.rate = rate;
    }
}
