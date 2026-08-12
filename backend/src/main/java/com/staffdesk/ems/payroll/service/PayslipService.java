package com.staffdesk.ems.payroll.service;

import com.staffdesk.ems.payroll.dto.PayslipResponse;
import com.staffdesk.ems.payroll.entity.Payslip;
import com.staffdesk.ems.payroll.exception.PayrollCalculationException;
import com.staffdesk.ems.payroll.repository.PayslipRepository;
import com.staffdesk.ems.payroll.service.port.PdfStoragePort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Read side of the payroll module — JSON payslip API (step 6) plus PDF byte
 * retrieval for the download endpoint (step 7). PDF generation itself lives in
 * PayslipPdfService, called from PayrollRunService at run time, not here.
 *
 * §7.4 assumption used below (role model still open): ADMIN/HR can view any
 * payslip; EMPLOYEE can only view their own. Role gating itself belongs on the
 * controller via @PreAuthorize — this service only enforces the *ownership* half
 * (an EMPLOYEE-role caller reading someone else's payslip id), since that can't be
 * expressed by @PreAuthorize alone without the id already in hand.
 */
@Service
@Transactional(readOnly = true)
public class PayslipService {

    private final PayslipRepository payslipRepository;
    private final PdfStoragePort pdfStoragePort;

    public PayslipService(PayslipRepository payslipRepository, PdfStoragePort pdfStoragePort) {
        this.payslipRepository = payslipRepository;
        this.pdfStoragePort = pdfStoragePort;
    }

    public List<PayslipResponse> getPayslipsForRun(Long payrollRunId) {
        return payslipRepository.findByPayrollRunId(payrollRunId).stream()
                .map(PayslipResponse::from)
                .toList();
    }

    /** Self-service history, newest first (§4.6's employee_id/generated_at index). */
    public List<PayslipResponse> getMyPayslips(Long employeeId) {
        return payslipRepository.findByEmployeeIdOrderByGeneratedAtDesc(employeeId).stream()
                .map(PayslipResponse::from)
                .toList();
    }

    /**
     * @param requesterEmployeeId the authenticated caller's employee id, or null if
     *                             the caller is ADMIN/HR (exempt from the ownership check)
     */
    public PayslipResponse getPayslip(Long payslipId, Long requesterEmployeeId) {
        Payslip payslip = findOwnedPayslip(payslipId, requesterEmployeeId);
        return PayslipResponse.from(payslip);
    }

    /** Same ownership rule as getPayslip; throws if the PDF hasn't been generated yet. */
    public byte[] getPdfBytes(Long payslipId, Long requesterEmployeeId) {
        Payslip payslip = findOwnedPayslip(payslipId, requesterEmployeeId);
        if (payslip.getPdfPath() == null) {
            throw new PayrollCalculationException("PDF not yet generated for payslip " + payslipId);
        }
        return pdfStoragePort.retrieve(payslip.getPdfPath());
    }

    private Payslip findOwnedPayslip(Long payslipId, Long requesterEmployeeId) {
        Payslip payslip = payslipRepository.findById(payslipId)
                .orElseThrow(() -> new PayrollCalculationException("Payslip not found: " + payslipId));

        if (requesterEmployeeId != null && !payslip.getEmployeeId().equals(requesterEmployeeId)) {
            throw new PayrollCalculationException("Not authorized to view this payslip");
        }
        return payslip;
    }
}
