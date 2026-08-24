package com.staffdesk.ems.attendance.controller;

import com.staffdesk.ems.attendance.dto.AttendanceResponse;
import com.staffdesk.ems.attendance.dto.AttendanceUpsertRequest;
import com.staffdesk.ems.attendance.service.AttendanceService;
import com.staffdesk.ems.auth.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // ---------- Self-service (any authenticated employee) ----------

    @PostMapping("/clock-in")
    public ResponseEntity<AttendanceResponse> clockIn(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(attendanceService.clockIn(principal.getEmployeeId()));
    }

    @PostMapping("/clock-out")
    public ResponseEntity<AttendanceResponse> clockOut(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(attendanceService.clockOut(principal.getEmployeeId()));
    }

    @GetMapping("/me")
    public ResponseEntity<Page<AttendanceResponse>> getMyHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(size = 20) Pageable pageable) {

        LocalDate[] range = resolveRange(from, to);
        return ResponseEntity.ok(attendanceService.getHistory(
                principal.getEmployeeId(), range[0], range[1], withDefaultSort(pageable)));
    }

    // ---------- Dashboard: recent activity across all employees ----------

    // Backs the Overview page's "Recent Attendance Logs" widget. Distinct
    // from /me (one user's own history) and /employees/{id} (one specific
    // employee) — this is the cross-employee feed the dashboard actually
    // needs, sorted however the caller asks (defaults to most recent first).
    @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
    @GetMapping("/recent")
    public ResponseEntity<Page<AttendanceResponse>> getRecentAcrossEmployees(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 5, sort = "attendanceDate", direction = Sort.Direction.DESC) Pageable pageable) {
        Long managerScopeId = isManagerOnly(principal) ? principal.getEmployeeId() : null;
        return ResponseEntity.ok(attendanceService.getRecentAcrossEmployees(managerScopeId, pageable));
    }

    // ---------- HR / Admin: view or override any employee's records ----------

    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @GetMapping("/employees/{employeeId}")
    public ResponseEntity<Page<AttendanceResponse>> getEmployeeHistory(
            @PathVariable Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(size = 20) Pageable pageable) {

        // ADMIN/HR only (no MANAGER on this route), so there's no manager
        // scope to enforce here -- pass null, same as AttendanceService's
        // ADMIN/HR path elsewhere (issue #4 only affects MANAGER-accessible
        // routes, i.e. /recent below).
        LocalDate[] range = resolveRange(from, to);
        return ResponseEntity.ok(attendanceService.getHistoryForEmployee(
                employeeId, null, range[0], range[1], withDefaultSort(pageable)));
    }

    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @GetMapping("/employees/{employeeId}/{date}")
    public ResponseEntity<AttendanceResponse> getEmployeeRecord(
            @PathVariable Long employeeId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getRecord(employeeId, date));
    }

    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @PutMapping("/employees/{employeeId}/{date}")
    public ResponseEntity<AttendanceResponse> upsertRecord(
            @PathVariable Long employeeId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody AttendanceUpsertRequest request) {
        return ResponseEntity.ok(attendanceService.upsert(employeeId, date, request));
    }

    // ---------- Helpers ----------

    // Issue #4: true only when the caller's sole review-capable role is
    // MANAGER. ADMIN or HR (even if also MANAGER) keep unrestricted
    // company-wide access on /recent above.
    private boolean isManagerOnly(UserPrincipal principal) {
        boolean isManager = false;
        for (GrantedAuthority authority : principal.getAuthorities()) {
            String role = authority.getAuthority();
            if (role.equals("ROLE_ADMIN") || role.equals("ROLE_HR")) {
                return false;
            }
            if (role.equals("ROLE_MANAGER")) {
                isManager = true;
            }
        }
        return isManager;
    }

    private LocalDate[] resolveRange(LocalDate from, LocalDate to) {
        LocalDate resolvedTo = to != null ? to : LocalDate.now();
        LocalDate resolvedFrom = from != null ? from : resolvedTo.minusDays(30);
        return new LocalDate[]{resolvedFrom, resolvedTo};
    }

    private Pageable withDefaultSort(Pageable pageable) {
        if (pageable.getSort().isSorted()) {
            return pageable;
        }
        return pageable instanceof org.springframework.data.domain.PageRequest pr
                ? pr.withSort(Sort.by(Sort.Direction.DESC, "attendanceDate"))
                : pageable;
    }
}