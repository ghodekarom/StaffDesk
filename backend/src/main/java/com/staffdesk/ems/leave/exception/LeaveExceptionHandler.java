package com.staffdesk.ems.leave.exception;

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

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Scoped to the leave package, same pattern as AttendanceExceptionHandler /
 * DepartmentExceptionHandler. If a global @RestControllerAdvice is ever
 * consolidated in common/, merge these handlers into it instead of keeping
 * a third copy of this error-shape boilerplate.
 */
@RestControllerAdvice(basePackages = "com.staffdesk.ems.leave")
public class LeaveExceptionHandler {

    @ExceptionHandler({
            InvalidLeaveDateRangeException.class,
            OverlappingLeaveRequestException.class,
            LeaveAlreadyDecidedException.class,
            InsufficientLeaveBalanceException.class
    })
    public ResponseEntity<Map<String, Object>> handleBadRequest(RuntimeException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage(), request);
    }

    @ExceptionHandler({
            LeaveRequestNotFoundException.class,
            EmployeeNotFoundForLeaveException.class
    })
    public ResponseEntity<Map<String, Object>> handleNotFound(RuntimeException ex, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), request);
    }

    private ResponseEntity<Map<String, Object>> build(HttpStatus status, String error, String message,
                                                        HttpServletRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", status.value());
        body.put("error", error);
        body.put("message", message);
        body.put("path", request.getRequestURI());
        return ResponseEntity.status(status).body(body);
    }
}
