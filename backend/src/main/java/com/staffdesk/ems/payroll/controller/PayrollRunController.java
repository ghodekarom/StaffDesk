package com.staffdesk.ems.payroll.controller;

import com.staffdesk.ems.auth.security.UserPrincipal;
import com.staffdesk.ems.payroll.dto.PayrollRunResponse;
import com.staffdesk.ems.payroll.dto.PayslipResponse;
import com.staffdesk.ems.payroll.service.PayrollRunService;
import com.staffdesk.ems.payroll.service.PayslipService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Payroll run processing and locking.
 *
 * <p><strong>Issue #7 Confirmed Role Model:</strong>
 * <ul>
 *   <li>{@code ADMIN} and {@code HR}: full access to trigger runs, view run details, lock runs, and access all payslips.</li>
 *   <li>{@code MANAGER} and {@code EMPLOYEE}: no payroll run administration access. Self-service access to own payslips
 *       is handled via {@link PayslipController#getMyPayslips} and PDF download.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/v1/payroll/runs")
public class PayrollRunController {

    private final PayrollRunService payrollRunService;
    private final PayslipService payslipService;

    public PayrollRunController(PayrollRunService payrollRunService, PayslipService payslipService) {
        this.payrollRunService = payrollRunService;
        this.payslipService = payslipService;
    }

    /**
     * Lookup-only, added so the admin payroll screen can restore an
     * already-processed run on page load/tab-switch instead of only ever
     * populating state right after a fresh "Process payroll" click. Returns
     * 404 (empty body) when no run exists yet for the period — the frontend
     * treats that as "nothing processed yet" rather than an error.
     */
    @GetMapping("/{year}/{month}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<PayrollRunResponse> getRun(@PathVariable int year, @PathVariable int month) {
        return payrollRunService.findRun(month, year)
                .map(PayrollRunResponse::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{year}/{month}/process")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public PayrollRunResponse process(@PathVariable int year, @PathVariable int month,
                                      @AuthenticationPrincipal UserPrincipal principal) {
        Long processedByEmployeeId = principal.getEmployeeId();
        return PayrollRunResponse.from(payrollRunService.processRun(month, year, processedByEmployeeId));
    }

    /**
     * 1.1: transitions PROCESSED -> LOCKED. Irreversible from here — there's no
     * unlock endpoint, by design, so the frontend must confirm before calling this.
     */
    @PatchMapping("/{id}/lock")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public PayrollRunResponse lock(@PathVariable Long id) {
        return PayrollRunResponse.from(payrollRunService.lockRun(id));
    }

    @GetMapping("/{runId}/payslips")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public List<PayslipResponse> getPayslipsForRun(@PathVariable Long runId) {
        return payslipService.getPayslipsForRun(runId);
    }
}