package com.staffdesk.ems.leave.service;

public class EmployeeNotFoundForLeaveException extends RuntimeException {
    public EmployeeNotFoundForLeaveException(Long employeeId) {
        super("No employee found with id " + employeeId);
    }
}
