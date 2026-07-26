package com.staffdesk.ems.leave.service;

public class LeaveRequestNotFoundException extends RuntimeException {
    public LeaveRequestNotFoundException(Long id) {
        super("No leave request found with id " + id);
    }
}
