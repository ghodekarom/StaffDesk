package com.staffdesk.ems.leave.service;

import com.staffdesk.ems.leave.entity.LeaveRequest;

import java.math.BigDecimal;

public class InsufficientLeaveBalanceException extends RuntimeException {
    public InsufficientLeaveBalanceException(LeaveRequest.LeaveType leaveType, BigDecimal remaining, long requestedDays) {
        super("Insufficient " + leaveType.name().toLowerCase() + " leave balance: " + remaining
                + " day(s) remaining, but " + requestedDays + " day(s) were requested");
    }
}
