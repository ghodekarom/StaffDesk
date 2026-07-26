package com.staffdesk.ems.leave.controller;

import com.staffdesk.ems.auth.security.UserPrincipal;
import com.staffdesk.ems.leave.dto.LeaveBalanceResponse;
import com.staffdesk.ems.leave.dto.LeaveDecisionRequest;
import com.staffdesk.ems.leave.dto.LeaveRequestCreateRequest;
import com.staffdesk.ems.leave.dto.LeaveRequestResponse;
import com.staffdesk.ems.leave.entity.LeaveRequest;
import com.staffdesk.ems.leave.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/leave")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    // ---------- Self-service (any authenticated employee) ----------

    @PostMapping("/requests")
    public ResponseEntity<LeaveRequestResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody LeaveRequestCreateRequest request) {
        LeaveRequestResponse created = leaveService.create(principal.getEmployeeId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/requests/me")
    public ResponseEntity<Page<LeaveRequestResponse>> getMyRequests(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) LeaveRequest.LeaveStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(leaveService.getMyRequests(
                principal.getEmployeeId(), status, withDefaultSort(pageable)));
    }

    @GetMapping("/balances/me")
    public ResponseEntity<List<LeaveBalanceResponse>> getMyBalances(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(leaveService.getMyBalances(principal.getEmployeeId(), year));
    }

    @PostMapping("/requests/{id}/cancel")
    public ResponseEntity<LeaveRequestResponse> cancel(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(leaveService.cancel(principal.getEmployeeId(), id));
    }

    // ---------- HR / Admin / Manager: approval workflow ----------

    @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
    @GetMapping("/requests")
    public ResponseEntity<Page<LeaveRequestResponse>> getAllRequests(
            @RequestParam(required = false) LeaveRequest.LeaveStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(leaveService.getAllRequests(status, withDefaultSort(pageable)));
    }

    @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
    @GetMapping("/requests/employees/{employeeId}")
    public ResponseEntity<Page<LeaveRequestResponse>> getRequestsForEmployee(
            @PathVariable Long employeeId,
            @RequestParam(required = false) LeaveRequest.LeaveStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(leaveService.getRequestsForEmployee(employeeId, status, withDefaultSort(pageable)));
    }

    @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
    @PostMapping("/requests/{id}/approve")
    public ResponseEntity<LeaveRequestResponse> approve(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody(required = false) LeaveDecisionRequest decision) {
        return ResponseEntity.ok(leaveService.approve(id, principal.getEmployeeId(), decision));
    }

    @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
    @PostMapping("/requests/{id}/reject")
    public ResponseEntity<LeaveRequestResponse> reject(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody(required = false) LeaveDecisionRequest decision) {
        return ResponseEntity.ok(leaveService.reject(id, principal.getEmployeeId(), decision));
    }

    // ---------- Helpers ----------

    private Pageable withDefaultSort(Pageable pageable) {
        if (pageable.getSort().isSorted()) {
            return pageable;
        }
        return pageable instanceof org.springframework.data.domain.PageRequest pr
                ? pr.withSort(Sort.by(Sort.Direction.DESC, "createdAt"))
                : pageable;
    }
}
