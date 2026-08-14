package com.staffdesk.ems.auth.exception;

public class AuthExceptions {

    private AuthExceptions() {
    }

    public static class EmailAlreadyExistsException extends RuntimeException {
        public EmailAlreadyExistsException(String email) {
            super("A user account with email '" + email + "' already exists");
        }
    }

    public static class EmployeeAlreadyHasAccountException extends RuntimeException {
        public EmployeeAlreadyHasAccountException(Long employeeId) {
            super("Employee " + employeeId + " already has a user account");
        }
    }

    public static class EmployeeNotFoundException extends RuntimeException {
        public EmployeeNotFoundException(Long employeeId) {
            super("No employee found with id " + employeeId);
        }
    }

    public static class InvalidRefreshTokenException extends RuntimeException {
        public InvalidRefreshTokenException() {
            super("Refresh token is invalid or expired");
        }
    }

    public static class InvalidCurrentPasswordException extends RuntimeException {
        public InvalidCurrentPasswordException() {
            super("Current password is incorrect");
        }
    }
}