package com.staffdesk.ems.leave.service;

public class OverlappingLeaveRequestException extends RuntimeException {
    public OverlappingLeaveRequestException() {
        super("You already have a leave request that overlaps with these dates");
    }
}
