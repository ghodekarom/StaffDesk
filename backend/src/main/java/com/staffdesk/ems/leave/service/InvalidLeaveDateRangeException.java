package com.staffdesk.ems.leave.service;

public class InvalidLeaveDateRangeException extends RuntimeException {
    public InvalidLeaveDateRangeException() {
        super("'endDate' must not be before 'startDate'");
    }
}
