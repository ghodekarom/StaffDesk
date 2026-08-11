package com.staffdesk.ems.payroll.service;

import com.staffdesk.ems.payroll.dto.PayslipResponse;
import com.staffdesk.ems.payroll.entity.Payslip;
import com.staffdesk.ems.payroll.exception.PayrollCalculationException;
import com.staffdesk.ems.payroll.repository.PayslipRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Read side of the payroll module — JSON payslip API (build step 6). PDF
 * generation/streaming is step 7, out of scope here.
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

    public PayslipService(PayslipRepository payslipRepository) {
        this.payslipRepository = payslipRepository;
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
        Payslip payslip = payslipRepository.findById(payslipId)
                .orElseThrow(() -> new PayrollCalculationException("Payslip not found: " + payslipId));

        if (requesterEmployeeId != null && !payslip.getEmployeeId().equals(requesterEmployeeId)) {
            throw new PayrollCalculationException("Not authorized to view this payslip");
        }

        return PayslipResponse.from(payslip);
    }
}
