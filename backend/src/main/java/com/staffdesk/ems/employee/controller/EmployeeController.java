package com.staffdesk.ems.employee.controller;

import com.staffdesk.ems.employee.dto.EmployeeRequestDto;
import com.staffdesk.ems.employee.dto.EmployeeResponseDto;
import com.staffdesk.ems.employee.dto.EmployeeStatusUpdateRequest;
import com.staffdesk.ems.employee.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
@Tag(name = "Employees", description = "CRUD operations for employee records")
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Create a new employee")
    public ResponseEntity<EmployeeResponseDto> create(@Valid @RequestBody EmployeeRequestDto request) {
        EmployeeResponseDto created = employeeService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single employee by id")
    public ResponseEntity<EmployeeResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getById(id));
    }

    @GetMapping
    @Operation(summary = "List employees (paginated), optionally filtered by a search term")
    public ResponseEntity<Page<EmployeeResponseDto>> getAll(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "lastName") Pageable pageable) {
        return ResponseEntity.ok(employeeService.search(search, pageable));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Update an existing employee")
    public ResponseEntity<EmployeeResponseDto> update(
            @PathVariable Long id, @Valid @RequestBody EmployeeRequestDto request) {
        return ResponseEntity.ok(employeeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate an employee",
            description = "Route kept as DELETE for API compatibility, but this deactivates " +
                    "the employee (status -> INACTIVE) rather than removing the record, so " +
                    "related history (attendance, leave, payroll, messages) is preserved.")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Change an employee's status",
            description = "Sets status to ACTIVE, INACTIVE, or TERMINATED. Broader than " +
                    "DELETE /{id} (which only ever deactivates): this also covers " +
                    "reactivating someone and marking them terminated. Open to ADMIN and " +
                    "HR, matching their existing PUT /{id} access to the rest of the record.")
    public ResponseEntity<EmployeeResponseDto> updateStatus(
            @PathVariable Long id, @Valid @RequestBody EmployeeStatusUpdateRequest request) {
        return ResponseEntity.ok(employeeService.updateStatus(id, request.status()));
    }
}