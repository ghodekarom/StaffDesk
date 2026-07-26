package com.staffdesk.ems.department.service;

public class InvalidHeadEmployeeException extends RuntimeException {
    public InvalidHeadEmployeeException(Long employeeId) {
        super("Employee " + employeeId + " does not exist or is not active, and cannot be set as department head");
    }
}
