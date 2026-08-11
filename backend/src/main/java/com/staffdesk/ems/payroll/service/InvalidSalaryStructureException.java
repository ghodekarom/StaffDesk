package com.staffdesk.ems.payroll.service;

public class InvalidSalaryStructureException extends RuntimeException {

    public InvalidSalaryStructureException(String message) {
        super(message);
    }
}
