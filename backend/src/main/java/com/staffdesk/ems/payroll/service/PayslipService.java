package com.staffdesk.ems.payroll.service;

import com.staffdesk.ems.payroll.dto.PayslipResponse;
import com.staffdesk.ems.payroll.entity.Payslip;
import com.staffdesk.ems.payroll.exception.PayrollCalculationException;
import com.staffdesk.ems.payroll.repository.PayslipRepository;
import com.staffdesk.ems.payroll.service.port.EmployeeDirectoryPort;
import com.staffdesk.ems.payroll.service.port.EmployeeDirectoryPort.EmployeePayrollProfile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * Read side of the payroll module — JSON payslip API (step 6) plus PDF
 * retrieval for the download endpoint (step 7).
 *
 * PDFs are NOT stored anywhere (no disk, no S3, no pdf_path lookup). They are
 * rendered on demand, straight from the Payslip + PayslipEarning rows already
 * in the database, on every download request. This sidesteps the multi-instance
 * / persistent-disk file-storage problem entirely — there's no file storage
 * dependency to fail. See PayslipPdfService for the render logic; it must
 * remain a pure function of (Payslip, employeeName) so that the same payslip
 * produces byte-identical PDFs on every call.
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
    private final PayslipPdfService payslipPdfService;
    private final EmployeeDirectoryPort employeeDirectoryPort;

    public PayslipService(PayslipRepository payslipRepository,
                          PayslipPdfService payslipPdfService,
                          EmployeeDirectoryPort employeeDirectoryPort) {
        this.payslipRepository = payslipRepository;
        this.payslipPdfService = payslipPdfService;
        this.employeeDirectoryPort = employeeDirectoryPort;
    }

    /**
     * 1.3: names are batch-resolved via findPayrollProfiles (one query for the
     * whole run) rather than calling findPayrollProfile per payslip — that
     * one-by-one pattern is fine for the single-PDF-render path below, where
     * there's only ever one employee involved, but would be an N+1 query here.
     */
    public List<PayslipResponse> getPayslipsForRun(Long payrollRunId) {
        List<Payslip> payslips = payslipRepository.findByPayrollRunId(payrollRunId);
        Map<Long, EmployeePayrollProfile> profiles = employeeDirectoryPort.findPayrollProfiles(
                payslips.stream().map(Payslip::getEmployeeId).distinct().toList());

        return payslips.stream()
                .map(p -> PayslipResponse.from(p, resolveEmployeeName(p.getEmployeeId(), profiles)))
                .toList();
    }

    /**
     * Self-service history, newest first (§4.6's employee_id/generated_at index).
     * Every row here belongs to the same caller, so one profile lookup covers the
     * whole list — no batching needed the way getPayslipsForRun needs it.
     */
    public List<PayslipResponse> getMyPayslips(Long employeeId) {
        String employeeName = resolveEmployeeName(employeeId);
        return payslipRepository.findByEmployeeIdOrderByGeneratedAtDesc(employeeId).stream()
                .map(p -> PayslipResponse.from(p, employeeName))
                .toList();
    }

    /**
     * @param requesterEmployeeId the authenticated caller's employee id, or null if
     *                             the caller is ADMIN/HR (exempt from the ownership check)
     */
    public PayslipResponse getPayslip(Long payslipId, Long requesterEmployeeId) {
        Payslip payslip = findOwnedPayslip(payslipId, requesterEmployeeId);
        String employeeName = resolveEmployeeName(payslip.getEmployeeId());
        return PayslipResponse.from(payslip, employeeName);
    }

    /**
     * Same ownership rule as getPayslip. Renders the PDF fresh on every call — nothing
     * is read from disk/S3. This method (and the class) is @Transactional, so the lazy
     * `earnings` collection on `payslip` is safe to access inside payslipPdfService.render():
     * it's still within the same Hibernate session that loaded the entity.
     */
    public byte[] getPdfBytes(Long payslipId, Long requesterEmployeeId) {
        Payslip payslip = findOwnedPayslip(payslipId, requesterEmployeeId);
        String employeeName = resolveEmployeeName(payslip.getEmployeeId());
        return payslipPdfService.render(payslip, employeeName);
    }

    /** Same lookup + "Employee #N" fallback that PayrollRunService uses at run time. */
    private String resolveEmployeeName(Long employeeId) {
        String displayName = employeeDirectoryPort.findPayrollProfile(employeeId).displayName();
        return displayName != null ? displayName : ("Employee #" + employeeId);
    }

    /** Batched variant — looks up the already-fetched profiles map instead of hitting the port again. */
    private String resolveEmployeeName(Long employeeId, Map<Long, EmployeePayrollProfile> profiles) {
        EmployeePayrollProfile profile = profiles.get(employeeId);
        String displayName = profile != null ? profile.displayName() : null;
        return displayName != null ? displayName : ("Employee #" + employeeId);
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