package com.staffdesk.ems.payroll.service;

import com.staffdesk.ems.payroll.entity.PayrollRun;
import com.staffdesk.ems.payroll.entity.PayrollRunStatus;
import com.staffdesk.ems.payroll.entity.Payslip;
import com.staffdesk.ems.payroll.entity.PayslipEarning;
import com.staffdesk.ems.payroll.entity.PayrollStatutorySettings;
import com.staffdesk.ems.payroll.entity.ProfessionalTaxSlab;
import com.staffdesk.ems.payroll.entity.TdsSlab;
import com.staffdesk.ems.payroll.exception.PayrollCalculationException;
import com.staffdesk.ems.payroll.repository.PayrollRunRepository;
import com.staffdesk.ems.payroll.repository.PayrollStatutorySettingsRepository;
import com.staffdesk.ems.payroll.repository.PayslipRepository;
import com.staffdesk.ems.payroll.repository.ProfessionalTaxSlabRepository;
import com.staffdesk.ems.payroll.repository.TdsSlabRepository;
import com.staffdesk.ems.payroll.service.calculation.EsiCalculator;
import com.staffdesk.ems.payroll.service.calculation.PfCalculator;
import com.staffdesk.ems.payroll.service.calculation.ProfessionalTaxCalculator;
import com.staffdesk.ems.payroll.service.calculation.TdsCalculator;
import com.staffdesk.ems.payroll.service.port.AttendanceLeavePort;
import com.staffdesk.ems.payroll.service.port.AttendanceLeavePort.AttendancePeriodSummary;
import com.staffdesk.ems.payroll.service.port.EmployeeDirectoryPort;
import com.staffdesk.ems.payroll.service.port.EmployeeDirectoryPort.EmployeePayrollProfile;
import com.staffdesk.ems.payroll.service.port.SalaryStructureLookupPort;
import com.staffdesk.ems.payroll.service.port.SalaryStructureLookupPort.SalaryStructureSnapshot;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

/**
 * Orchestrates a payroll run across all active employees for a given period
 * (build order step 5). Composes the pure calculators from step 3 with the
 * settings/slab lookups from step 4 and the employee/attendance data reached
 * through the ports in {@code service.port}.
 *
 * ASSUMPTIONS MADE TO UNBLOCK THIS STEP (§7 is still open — swap any of these by
 * changing the relevant private method, not the overall shape of this class):
 *  §7.2 pay cycle      -> calendar month (1st to last day).
 *  §7.3 LOP rule        -> delegated entirely to AttendanceLeavePort's implementation
 *                          (assumed: no attendance + no approved paid leave = LOP).
 *  §7.4 role access     -> NOT enforced here; enforce at the controller layer
 *                          (@PreAuthorize) per the proposed role model in §7.4.
 *  §7.5 joiners/leavers -> pro-rated via paid_days/working_days, same mechanism as
 *                          any other LOP. TDS is annualized off the full monthly
 *                          rate and divided by the employee's remaining months in
 *                          the financial year, not a running actual-to-date figure.
 *
 * KNOWN SIMPLIFICATION: TDS here is a per-period estimate (annualize this month's
 * gross, divide by remaining months) rather than a true year-to-date reconciliation
 * that accounts for months already paid, bonuses, or a mid-year rate change. Fine
 * for a first cut; flag before relying on it for real deductions.
 */
@Service
public class PayrollRunService {

    private static final Logger log = LoggerFactory.getLogger(PayrollRunService.class);

    private final PayrollRunRepository payrollRunRepository;
    private final PayslipRepository payslipRepository;
    private final PayrollStatutorySettingsRepository settingsRepository;
    private final TdsSlabRepository tdsSlabRepository;
    private final ProfessionalTaxSlabRepository professionalTaxSlabRepository;

    private final SalaryStructureLookupPort salaryStructureLookupPort;
    private final AttendanceLeavePort attendanceLeavePort;
    private final EmployeeDirectoryPort employeeDirectoryPort;

    private final PfCalculator pfCalculator = new PfCalculator();
    private final EsiCalculator esiCalculator = new EsiCalculator();
    private final ProfessionalTaxCalculator professionalTaxCalculator = new ProfessionalTaxCalculator();
    private final TdsCalculator tdsCalculator = new TdsCalculator();

    public PayrollRunService(PayrollRunRepository payrollRunRepository,
                              PayslipRepository payslipRepository,
                              PayrollStatutorySettingsRepository settingsRepository,
                              TdsSlabRepository tdsSlabRepository,
                              ProfessionalTaxSlabRepository professionalTaxSlabRepository,
                              SalaryStructureLookupPort salaryStructureLookupPort,
                              AttendanceLeavePort attendanceLeavePort,
                              EmployeeDirectoryPort employeeDirectoryPort) {
        this.payrollRunRepository = payrollRunRepository;
        this.payslipRepository = payslipRepository;
        this.settingsRepository = settingsRepository;
        this.tdsSlabRepository = tdsSlabRepository;
        this.professionalTaxSlabRepository = professionalTaxSlabRepository;
        this.salaryStructureLookupPort = salaryStructureLookupPort;
        this.attendanceLeavePort = attendanceLeavePort;
        this.employeeDirectoryPort = employeeDirectoryPort;
    }

    /**
     * Finds-or-creates the run for periodMonth/periodYear, computes a payslip for
     * every active employee, and marks the run PROCESSED. Re-running a DRAFT or
     * PROCESSED run regenerates each employee's payslip in place (upsert on the
     * payroll_run_id+employee_id unique constraint); a LOCKED run refuses writes.
     */
    @Transactional
    public PayrollRun processRun(int periodMonth, int periodYear, Long processedByEmployeeId) {
        PayrollRun run = payrollRunRepository.findByPeriodMonthAndPeriodYear(periodMonth, periodYear)
                .orElseGet(() -> payrollRunRepository.save(new PayrollRun(periodMonth, periodYear)));

        if (run.getStatus() == PayrollRunStatus.LOCKED) {
            throw new PayrollCalculationException(
                    "Payroll run for " + periodYear + "-" + periodMonth + " is LOCKED and cannot be reprocessed");
        }

        YearMonth ym = YearMonth.of(periodYear, periodMonth);
        LocalDate periodStart = ym.atDay(1);          // §7.2 assumption: calendar month cycle
        LocalDate periodEnd = ym.atEndOfMonth();

        PayrollStatutorySettings settings = settingsRepository.findApplicableSettings(periodEnd)
                .orElseThrow(() -> new PayrollCalculationException(
                        "No payroll_statutory_settings row covers " + periodEnd));

        String financialYear = financialYearFor(periodEnd);
        List<TdsSlab> tdsSlabs = tdsSlabRepository.findByFinancialYearOrderBySlabOrderAsc(financialYear);
        if (tdsSlabs.isEmpty()) {
            throw new PayrollCalculationException("No tds_slabs seeded for financial year " + financialYear);
        }

        for (Long employeeId : employeeDirectoryPort.findActiveEmployeeIds(periodEnd)) {
            try {
                processEmployee(run, employeeId, periodStart, periodEnd, settings, tdsSlabs);
            } catch (PayrollCalculationException e) {
                // One employee missing a salary structure (or similar) shouldn't sink
                // the whole run; surface it clearly and keep going.
                log.warn("Skipping employee {} for run {}-{}: {}", employeeId, periodYear, periodMonth, e.getMessage());
            }
        }

        run.setStatus(PayrollRunStatus.PROCESSED);
        run.setProcessedAt(Instant.now());
        run.setProcessedBy(processedByEmployeeId);
        return payrollRunRepository.save(run);
    }

    private void processEmployee(PayrollRun run, Long employeeId, LocalDate periodStart, LocalDate periodEnd,
                                  PayrollStatutorySettings settings, List<TdsSlab> tdsSlabs) {

        SalaryStructureSnapshot salary = salaryStructureLookupPort.findApplicable(employeeId, periodEnd)
                .orElseThrow(() -> new PayrollCalculationException(
                        "No active salary structure for employee " + employeeId + " as of " + periodEnd));

        EmployeePayrollProfile profile = employeeDirectoryPort.findPayrollProfile(employeeId);

        AttendancePeriodSummary attendance = attendanceLeavePort.summarize(employeeId, periodStart, periodEnd);
        BigDecimal prorationFactor = attendance.prorationFactor();

        BigDecimal grossEarnings = round(salary.grossMonthly().multiply(prorationFactor));
        BigDecimal basicProrated = round(salary.basic().multiply(prorationFactor));

        PfCalculator.PfResult pf = pfCalculator.calculate(basicProrated, toPfRates(settings));

        boolean alreadyEsiContributing = payslipRepository.existsEsiApplicablePriorInPeriod(
                employeeId, esiPeriodStart(periodEnd), esiPeriodEnd(periodEnd));
        EsiCalculator.EsiResult esi = esiCalculator.calculate(
                grossEarnings, profile.hasDisability(), alreadyEsiContributing, toEsiRates(settings));

        BigDecimal professionalTax;
        if (profile.workState() == null) {
            // §7.1 still open: no work_state column yet. Treated as "no PT applied"
            // rather than failing the run — but this is NOT the same as a state
            // that genuinely doesn't levy PT, so it's worth surfacing loudly once
            // work_state exists and this starts masking real gaps.
            log.warn("Employee {} has no work_state; skipping Professional Tax", employeeId);
            professionalTax = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        } else {
            List<ProfessionalTaxSlab> ptSlabs =
                    professionalTaxSlabRepository.findApplicableSlabs(profile.workState(), periodEnd);
            professionalTax = professionalTaxCalculator.calculate(grossEarnings, toPtSlabs(ptSlabs));
        }

        int remainingMonths = monthsRemainingInFinancialYear(periodEnd);
        BigDecimal annualProjectedGross = salary.grossMonthly().multiply(BigDecimal.valueOf(12));
        TdsCalculator.TdsResult tds = tdsCalculator.calculate(
                annualProjectedGross,
                settings.getTdsStandardDeduction(),
                toTdsSlabs(tdsSlabs),
                toRebateRule(settings),
                settings.getTdsCessRate(),
                remainingMonths);

        BigDecimal totalDeductions = pf.employeeContribution()
                .add(esi.employeeContribution())
                .add(professionalTax)
                .add(tds.monthlyTds());
        BigDecimal netPay = grossEarnings.subtract(totalDeductions);

        Payslip payslip = payslipRepository.findByPayrollRunIdAndEmployeeId(run.getId(), employeeId)
                .orElseGet(Payslip::new);

        payslip.setPayrollRun(run);
        payslip.setEmployeeId(employeeId);
        payslip.setSalaryStructureId(salary.salaryStructureId());
        payslip.setWorkingDays(attendance.workingDays());
        payslip.setPaidDays(attendance.paidDays());
        payslip.setGrossEarnings(grossEarnings);
        payslip.setPfEmployee(pf.employeeContribution());
        payslip.setPfEmployer(pf.employerTotalCost());
        payslip.setEsiEmployee(esi.employeeContribution());
        payslip.setEsiEmployer(esi.employerContribution());
        payslip.setProfessionalTax(professionalTax);
        payslip.setTds(tds.monthlyTds());
        payslip.setTotalDeductions(round(totalDeductions));
        payslip.setNetPay(round(netPay));
        payslip.setGeneratedAt(Instant.now());
        payslip.setEarnings(earningsBreakdown(salary, prorationFactor));

        payslipRepository.save(payslip);
    }

    private List<PayslipEarning> earningsBreakdown(SalaryStructureSnapshot salary, BigDecimal factor) {
        return List.of(
                new PayslipEarning("BASIC", round(salary.basic().multiply(factor))),
                new PayslipEarning("HRA", round(salary.hra().multiply(factor))),
                new PayslipEarning("CONVEYANCE", round(salary.conveyanceAllowance().multiply(factor))),
                new PayslipEarning("SPECIAL", round(salary.specialAllowance().multiply(factor))),
                new PayslipEarning("OTHER", round(salary.otherAllowance().multiply(factor)))
        );
    }

    // --- mapping helpers: entity/settings rows -> calculator input records ---

    private PfCalculator.PfRates toPfRates(PayrollStatutorySettings s) {
        return new PfCalculator.PfRates(
                s.getPfEmployeeRate(), s.getPfEmployerRate(), s.getPfWageCeiling(),
                s.getPfEpsRate(), s.getPfEpsCeiling(), s.getPfEdliRate(),
                s.getPfAdminChargeRate(), s.getPfAdminChargeMinimum());
    }

    private EsiCalculator.EsiRates toEsiRates(PayrollStatutorySettings s) {
        // Disability wage ceiling isn't a settings column in §4.3; using ESI's
        // standard ₹25,000 figure directly here is a known gap — same category as
        // the PF split/TDS rebate gaps flagged in step 4, worth adding a column for.
        return new EsiCalculator.EsiRates(
                s.getEsiEmployeeRate(), s.getEsiEmployerRate(), s.getEsiWageCeiling(),
                new BigDecimal("25000.00"));
    }

    private List<ProfessionalTaxCalculator.ProfessionalTaxSlab> toPtSlabs(List<ProfessionalTaxSlab> slabs) {
        return slabs.stream()
                .map(s -> new ProfessionalTaxCalculator.ProfessionalTaxSlab(
                        s.getFromAmount(), s.getToAmount(), s.getMonthlyAmount()))
                .toList();
    }

    private List<TdsCalculator.TdsSlab> toTdsSlabs(List<TdsSlab> slabs) {
        return slabs.stream()
                .map(s -> new TdsCalculator.TdsSlab(s.getSlabOrder(), s.getFromAmount(), s.getToAmount(), s.getRate()))
                .toList();
    }

    private TdsCalculator.TdsRebateRule toRebateRule(PayrollStatutorySettings s) {
        if (s.getTdsRebateThreshold() == null || s.getTdsRebateMaxAmount() == null) {
            return null;
        }
        return new TdsCalculator.TdsRebateRule(s.getTdsRebateThreshold(), s.getTdsRebateMaxAmount());
    }

    // --- date helpers ---

    /** Indian financial year runs Apr–Mar, e.g. Feb 2027 -> "2026-2027". */
    private String financialYearFor(LocalDate date) {
        int startYear = date.getMonthValue() >= 4 ? date.getYear() : date.getYear() - 1;
        return startYear + "-" + (startYear + 1);
    }

    private int monthsRemainingInFinancialYear(LocalDate date) {
        int fyEndMonth = 3; // March
        int fyEndYear = date.getMonthValue() >= 4 ? date.getYear() + 1 : date.getYear();
        YearMonth current = YearMonth.from(date);
        YearMonth fyEnd = YearMonth.of(fyEndYear, fyEndMonth);
        int months = (int) current.until(fyEnd, java.time.temporal.ChronoUnit.MONTHS) + 1;
        return Math.max(months, 1);
    }

    private LocalDate esiPeriodStart(LocalDate date) {
        boolean firstHalf = date.getMonthValue() >= 4 && date.getMonthValue() <= 9;
        return firstHalf ? LocalDate.of(date.getYear(), 4, 1)
                : (date.getMonthValue() >= 10
                    ? LocalDate.of(date.getYear(), 10, 1)
                    : LocalDate.of(date.getYear() - 1, 10, 1));
    }

    private LocalDate esiPeriodEnd(LocalDate date) {
        boolean firstHalf = date.getMonthValue() >= 4 && date.getMonthValue() <= 9;
        return firstHalf ? LocalDate.of(date.getYear(), 9, 30)
                : (date.getMonthValue() >= 10
                    ? LocalDate.of(date.getYear() + 1, 3, 31)
                    : LocalDate.of(date.getYear(), 3, 31));
    }

    private BigDecimal round(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
