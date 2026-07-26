package com.staffdesk.ems.department.controller;

import com.staffdesk.ems.department.service.DepartmentNotFoundException;
import com.staffdesk.ems.department.service.DuplicateDepartmentNameException;
import com.staffdesk.ems.department.service.InvalidHeadEmployeeException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Scoped to the department package. If a global @RestControllerAdvice already
 * exists in common/, merge these three handlers into it instead of keeping
 * a second one — same note as AuthExceptionHandler.
 */
@RestControllerAdvice(basePackages = "com.staffdesk.ems.department")
public class DepartmentExceptionHandler {

    @ExceptionHandler(DepartmentNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(DepartmentNotFoundException ex,
                                                                HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), request);
    }

    @ExceptionHandler(DuplicateDepartmentNameException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicate(DuplicateDepartmentNameException ex,
                                                                 HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, "Conflict", ex.getMessage(), request);
    }

    @ExceptionHandler(InvalidHeadEmployeeException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidHead(InvalidHeadEmployeeException ex,
                                                                   HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage(), request);
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
