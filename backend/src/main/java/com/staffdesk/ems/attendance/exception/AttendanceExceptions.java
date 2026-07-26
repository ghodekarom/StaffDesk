package com.staffdesk.ems.attendance.exception;

import java.time.LocalDate;

public class AttendanceExceptions {

    private AttendanceExceptions() {
    }

    public static class AlreadyClockedInException extends RuntimeException {
        public AlreadyClockedInException() {
            super("You have already clocked in today");
        }
    }

    public static class NotClockedInException extends RuntimeException {
        public NotClockedInException() {
            super("You must clock in before clocking out");
        }
    }

    public static class AlreadyClockedOutException extends RuntimeException {
        public AlreadyClockedOutException() {
            super("You have already clocked out today");
        }
    }

    public static class RecordNotFoundException extends RuntimeException {
        public RecordNotFoundException(Long employeeId, LocalDate date) {
            super("No attendance record found for employee " + employeeId + " on " + date);
        }
    }

    public static class EmployeeNotFoundException extends RuntimeException {
        public EmployeeNotFoundException(Long employeeId) {
            super("No employee found with id " + employeeId);
        }
    }

    public static class InvalidDateRangeException extends RuntimeException {
        public InvalidDateRangeException() {
            super("'from' date must not be after 'to' date");
        }
    }
}
