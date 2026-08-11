package com.staffdesk.ems.payroll.service;

public class EmployeeNotFoundForPayrollException extends RuntimeException {

    public EmployeeNotFoundForPayrollException(Long employeeId) {
        super("No employee found with id " + employeeId);
    }
}
