package com.staffdesk.ems.payroll.controller;

import com.staffdesk.ems.payroll.dto.PayslipResponse;
import com.staffdesk.ems.payroll.service.PayslipService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payroll/payslips")
public class PayslipController {

    private final PayslipService payslipService;

    public PayslipController(PayslipService payslipService) {
        this.payslipService = payslipService;
    }

    /** ADMIN/HR only — any employee's payslip by id. */
    @GetMapping("/{payslipId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public PayslipResponse getPayslip(@PathVariable Long payslipId) {
        return payslipService.getPayslip(payslipId, null);
    }

    /** EMPLOYEE self-service — own payslips only, read-only, per §7.4. */
    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public List<PayslipResponse> getMyPayslips(Authentication authentication) {
        Long employeeId = currentEmployeeId(authentication);
        return payslipService.getMyPayslips(employeeId);
    }

    /**
     * Streams the stored PDF (step 7, §6) rather than regenerating it — it was
     * already rendered by PayslipPdfService at run time. ADMIN/HR can fetch any
     * payslip's PDF; anyone else can only fetch their own.
     */
    @GetMapping("/{payslipId}/pdf")
    @PreAuthorize("hasAnyRole('ADMIN','HR','EMPLOYEE')")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long payslipId, Authentication authentication) {
        Long requesterEmployeeId = isElevated(authentication) ? null : currentEmployeeId(authentication);
        byte[] pdf = payslipService.getPdfBytes(payslipId, requesterEmployeeId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"payslip-" + payslipId + ".pdf\"")
                .body(pdf);
    }

    private boolean isElevated(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN") || a.equals("ROLE_HR"));
    }

    /** Same placeholder as PayrollRunController — wire to the existing principal resolver. */
    private Long currentEmployeeId(Authentication authentication) {
        throw new UnsupportedOperationException(
                "Wire this to the existing JWT-principal -> employee id resolver used elsewhere in the app");
    }
}
