package com.staffdesk.ems.leave.service;

import com.staffdesk.ems.leave.entity.LeaveRequest;

public class LeaveAlreadyDecidedException extends RuntimeException {
    public LeaveAlreadyDecidedException(LeaveRequest.LeaveStatus currentStatus) {
        super("This leave request has already been " + currentStatus.name().toLowerCase() + " and cannot be changed");
    }
}
