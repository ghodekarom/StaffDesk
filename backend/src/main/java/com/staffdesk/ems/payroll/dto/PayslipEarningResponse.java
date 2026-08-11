package com.staffdesk.ems.payroll.dto;

import com.staffdesk.ems.payroll.entity.PayslipEarning;

import java.math.BigDecimal;

public record PayslipEarningResponse(String componentName, BigDecimal amount) {

    public static PayslipEarningResponse from(PayslipEarning earning) {
        return new PayslipEarningResponse(earning.getComponentName(), earning.getAmount());
    }
}
