package com.staffdesk.ems.payroll.exception;

import com.staffdesk.ems.payroll.service.EmployeeNotFoundForPayrollException;
import com.staffdesk.ems.payroll.service.InvalidSalaryStructureException;
import com.staffdesk.ems.payroll.service.SalaryStructureNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Scoped to the payroll package, same pattern as LeaveExceptionHandler /
 * DepartmentExceptionHandler / AttendanceExceptionHandler. If a global
 * @RestControllerAdvice is ever consolidated in common/, merge this in too.
 */
@RestControllerAdvice(basePackages = "com.staffdesk.ems.payroll")
public class PayrollExceptionHandler {

    @ExceptionHandler(InvalidSalaryStructureException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(RuntimeException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage(), request);
    }

    @ExceptionHandler({
            SalaryStructureNotFoundException.class,
            EmployeeNotFoundForPayrollException.class
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
