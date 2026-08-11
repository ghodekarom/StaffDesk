package com.staffdesk.ems.payroll.controller;

import com.staffdesk.ems.auth.security.UserPrincipal;
import com.staffdesk.ems.payroll.dto.SalaryStructureCreateRequest;
import com.staffdesk.ems.payroll.dto.SalaryStructureResponse;
import com.staffdesk.ems.payroll.service.SalaryStructureService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payroll/salary-structures")
public class SalaryStructureController {

    private final SalaryStructureService salaryStructureService;

    public SalaryStructureController(SalaryStructureService salaryStructureService) {
        this.salaryStructureService = salaryStructureService;
    }

    // ---------- Self-service (any authenticated employee) ----------

    @GetMapping("/me/current")
    public ResponseEntity<SalaryStructureResponse> getMyCurrent(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(salaryStructureService.getCurrent(principal.getEmployeeId()));
    }

    // ---------- HR / Admin: create revisions, view any employee's structure ----------
    // Role split follows the Phase 2 scoping doc's proposed default (§7.4):
    // salary data is restricted to ADMIN/HR, consistent with the original
    // non-functional requirement that sensitive fields be role-restricted at
    // the query level, not just hidden in the UI. Revisit if that default
    // decision changes.

    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @PostMapping
    public ResponseEntity<SalaryStructureResponse> createRevision(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SalaryStructureCreateRequest request) {
        SalaryStructureResponse created = salaryStructureService.createRevision(
                principal.getEmployeeId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @GetMapping("/employees/{employeeId}/current")
    public ResponseEntity<SalaryStructureResponse> getEmployeeCurrent(@PathVariable Long employeeId) {
        return ResponseEntity.ok(salaryStructureService.getCurrent(employeeId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @GetMapping("/employees/{employeeId}/history")
    public ResponseEntity<Page<SalaryStructureResponse>> getEmployeeHistory(
            @PathVariable Long employeeId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(salaryStructureService.getHistory(employeeId, pageable));
    }
}
