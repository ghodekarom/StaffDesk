package com.staffdesk.ems.payroll.service;

public class SalaryStructureNotFoundException extends RuntimeException {

    public SalaryStructureNotFoundException(Long employeeId) {
        super("No active salary structure found for employee id " + employeeId);
    }
}
