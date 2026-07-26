package com.staffdesk.ems.department.service;

public class DepartmentNotFoundException extends RuntimeException {
    public DepartmentNotFoundException(Long id) {
        super("No department found with id " + id);
    }
}
