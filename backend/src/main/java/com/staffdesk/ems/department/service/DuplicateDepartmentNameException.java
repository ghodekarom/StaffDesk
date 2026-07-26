package com.staffdesk.ems.department.service;

public class DuplicateDepartmentNameException extends RuntimeException {
    public DuplicateDepartmentNameException(String name) {
        super("A department named '" + name + "' already exists");
    }
}
