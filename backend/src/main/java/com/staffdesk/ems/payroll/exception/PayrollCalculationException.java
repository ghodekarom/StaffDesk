package com.staffdesk.ems.payroll.exception;

/**
 * Follows the ResourceNotFoundException / DuplicateResourceException pattern
 * referenced in §5 — swap the superclass/constructors to match those base classes
 * exactly if this codebase has a shared exception hierarchy already.
 */
public class PayrollCalculationException extends RuntimeException {

    public PayrollCalculationException(String message) {
        super(message);
    }

    public PayrollCalculationException(String message, Throwable cause) {
        super(message, cause);
    }
}
