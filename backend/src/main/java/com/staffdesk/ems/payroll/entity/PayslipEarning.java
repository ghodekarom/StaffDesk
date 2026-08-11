package com.staffdesk.ems.payroll.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

/** Earnings breakdown per payslip, child table (§4.7) — kept flexible for new allowance types. */
@Entity
@Table(name = "payslip_earnings")
public class PayslipEarning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payslip_id", nullable = false)
    private Payslip payslip;

    @Column(name = "component_name", nullable = false)
    private String componentName;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    protected PayslipEarning() {
        // JPA
    }

    public PayslipEarning(String componentName, BigDecimal amount) {
        this.componentName = componentName;
        this.amount = amount;
    }

    public Long getId() {
        return id;
    }

    public Payslip getPayslip() {
        return payslip;
    }

    public void setPayslip(Payslip payslip) {
        this.payslip = payslip;
    }

    public String getComponentName() {
        return componentName;
    }

    public BigDecimal getAmount() {
        return amount;
    }
}
