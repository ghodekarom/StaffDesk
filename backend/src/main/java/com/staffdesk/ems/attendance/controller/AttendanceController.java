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

    // ---------- HR / Admin: view or override any employee's records ----------

    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @GetMapping("/employees/{employeeId}")
    public ResponseEntity<Page<AttendanceResponse>> getEmployeeHistory(
            @PathVariable Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(size = 20) Pageable pageable) {

        LocalDate[] range = resolveRange(from, to);
        return ResponseEntity.ok(attendanceService.getHistoryForEmployee(
                employeeId, range[0], range[1], withDefaultSort(pageable)));
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
