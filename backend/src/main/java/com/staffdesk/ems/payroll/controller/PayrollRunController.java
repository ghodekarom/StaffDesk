package com.staffdesk.ems.payroll.controller;

import com.staffdesk.ems.auth.security.UserPrincipal;
import com.staffdesk.ems.payroll.dto.PayrollRunResponse;
import com.staffdesk.ems.payroll.dto.PayslipResponse;
import com.staffdesk.ems.payroll.service.PayrollRunService;
import com.staffdesk.ems.payroll.service.PayslipService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * §7.4 assumption (still open, proposed default used here): ADMIN/HR can trigger
 * runs and view all payslips; MANAGER has no payroll access; EMPLOYEE is
 * self-service only (see PayslipController#getMyPayslips). Adjust the
 * @PreAuthorize expressions once the team confirms the real role model.
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

    @PostMapping("/{year}/{month}/process")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public PayrollRunResponse process(@PathVariable int year, @PathVariable int month,
                                      @AuthenticationPrincipal UserPrincipal principal) {
        Long processedByEmployeeId = principal.getEmployeeId();
        return PayrollRunResponse.from(payrollRunService.processRun(month, year, processedByEmployeeId));
    }

    @GetMapping("/{runId}/payslips")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public List<PayslipResponse> getPayslipsForRun(@PathVariable Long runId) {
        return payslipService.getPayslipsForRun(runId);
    }
}