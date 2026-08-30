package com.staffdesk.ems.leave.exception;

import com.staffdesk.ems.common.dto.ApiErrorResponse;
import com.staffdesk.ems.leave.service.EmployeeNotFoundForLeaveException;
import com.staffdesk.ems.leave.service.InsufficientLeaveBalanceException;
import com.staffdesk.ems.leave.service.InvalidLeaveDateRangeException;
import com.staffdesk.ems.leave.service.LeaveAlreadyDecidedException;
import com.staffdesk.ems.leave.service.LeaveRequestNotFoundException;
import com.staffdesk.ems.leave.service.OverlappingLeaveRequestException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Issue #12: Scoped to the leave package. All leave-specific validation
 * errors now return a consistent {@link ApiErrorResponse} body (same
 * shape as {@code GlobalExceptionHandler}), instead of the previous
 * ad-hoc {@code Map<String, Object>} format. This ensures the frontend
 * can parse error responses uniformly across all modules.
 */
@RestControllerAdvice(basePackages = "com.staffdesk.ems.leave")
public class LeaveExceptionHandler {

    @ExceptionHandler({
            InvalidLeaveDateRangeException.class,
            OverlappingLeaveRequestException.class,
            LeaveAlreadyDecidedException.class,
            InsufficientLeaveBalanceException.class
    })
    public ResponseEntity<ApiErrorResponse> handleBadRequest(RuntimeException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler({
            LeaveRequestNotFoundException.class,
            EmployeeNotFoundForLeaveException.class
    })
    public ResponseEntity<ApiErrorResponse> handleNotFound(RuntimeException ex, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    private ResponseEntity<ApiErrorResponse> build(HttpStatus status, String message, HttpServletRequest request) {
        ApiErrorResponse body = ApiErrorResponse.of(status.value(), status.getReasonPhrase(), message, request.getRequestURI());
        return ResponseEntity.status(status).body(body);
    }
}
