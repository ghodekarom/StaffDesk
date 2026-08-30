package com.staffdesk.ems.payroll.service;

import com.staffdesk.ems.payroll.entity.PayrollRun;
import com.staffdesk.ems.payroll.entity.PayrollStatutorySettings;
import com.staffdesk.ems.payroll.entity.Payslip;
import com.staffdesk.ems.payroll.entity.ProfessionalTaxSlab;
import com.staffdesk.ems.payroll.entity.TdsSlab;
import com.staffdesk.ems.payroll.repository.PayrollRunRepository;
import com.staffdesk.ems.payroll.repository.PayrollStatutorySettingsRepository;
import com.staffdesk.ems.payroll.repository.PayslipRepository;
import com.staffdesk.ems.payroll.repository.ProfessionalTaxSlabRepository;
import com.staffdesk.ems.payroll.repository.TdsSlabRepository;
import com.staffdesk.ems.payroll.service.port.AttendanceLeavePort;
import com.staffdesk.ems.payroll.service.port.AttendanceLeavePort.AttendancePeriodSummary;
import com.staffdesk.ems.payroll.service.port.EmployeeDirectoryPort;
import com.staffdesk.ems.payroll.service.port.EmployeeDirectoryPort.EmployeePayrollProfile;
import com.staffdesk.ems.payroll.service.port.SalaryStructureLookupPort;
import com.staffdesk.ems.payroll.service.port.SalaryStructureLookupPort.SalaryStructureSnapshot;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PayrollRunServiceTest {

    private PayrollRunRepository payrollRunRepository;
    private PayslipRepository payslipRepository;
    private PayrollStatutorySettingsRepository settingsRepository;
    private TdsSlabRepository tdsSlabRepository;
    private ProfessionalTaxSlabRepository professionalTaxSlabRepository;
    private SalaryStructureLookupPort salaryStructureLookupPort;
    private AttendanceLeavePort attendanceLeavePort;
    private EmployeeDirectoryPort employeeDirectoryPort;

    private PayrollRunService service;

    private static final Long EMPLOYEE_ID = 1L;

    @BeforeEach
    void setUp() {
        payrollRunRepository = mock(PayrollRunRepository.class);
        payslipRepository = mock(PayslipRepository.class);
        settingsRepository = mock(PayrollStatutorySettingsRepository.class);
        tdsSlabRepository = mock(TdsSlabRepository.class);
        professionalTaxSlabRepository = mock(ProfessionalTaxSlabRepository.class);
        salaryStructureLookupPort = mock(SalaryStructureLookupPort.class);
        attendanceLeavePort = mock(AttendanceLeavePort.class);
        employeeDirectoryPort = mock(EmployeeDirectoryPort.class);

        service = new PayrollRunService(
                payrollRunRepository, payslipRepository, settingsRepository, tdsSlabRepository,
                professionalTaxSlabRepository, salaryStructureLookupPort, attendanceLeavePort,
                employeeDirectoryPort);
    }

    @Test
    void processRun_singleEmployee_noLop_computesExpectedPayslip() throws Exception {
        PayrollRun run = new PayrollRun(3, 2027); // Mar 2027 -> FY2026-2027
        setId(run, 100L);
        when(payrollRunRepository.findByPeriodMonthAndPeriodYear(3, 2027)).thenReturn(Optional.of(run));
        when(payrollRunRepository.save(any(PayrollRun.class))).thenReturn(run);

        when(settingsRepository.findApplicableSettings(any(LocalDate.class)))
                .thenReturn(Optional.of(seededSettings()));
        when(tdsSlabRepository.findByFinancialYearOrderBySlabOrderAsc("2026-2027"))
                .thenReturn(fy2026_27Slabs());

        when(employeeDirectoryPort.findActiveEmployeeIds(any(LocalDate.class)))
                .thenReturn(List.of(EMPLOYEE_ID));
        when(employeeDirectoryPort.findPayrollProfile(EMPLOYEE_ID))
                .thenReturn(new EmployeePayrollProfile(EMPLOYEE_ID, "Test Employee", "Maharashtra", false,
                        LocalDate.of(2020, 1, 1), null));

        when(salaryStructureLookupPort.findApplicable(eq(EMPLOYEE_ID), any(LocalDate.class)))
                .thenReturn(Optional.of(new SalaryStructureSnapshot(
                        10L,
                        new BigDecimal("20000.00"), new BigDecimal("8000.00"),
                        new BigDecimal("1600.00"), new BigDecimal("2000.00"), BigDecimal.ZERO)));

        when(attendanceLeavePort.summarize(eq(EMPLOYEE_ID), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(new AttendancePeriodSummary(30, new BigDecimal("30")));

        when(payslipRepository.existsEsiApplicablePriorInPeriod(eq(EMPLOYEE_ID), any(), any()))
                .thenReturn(false);
        when(payslipRepository.findByPayrollRunIdAndEmployeeId(100L, EMPLOYEE_ID))
                .thenReturn(Optional.empty());
        when(professionalTaxSlabRepository.findApplicableSlabs(eq("Maharashtra"), any(LocalDate.class)))
                .thenReturn(maharashtraSlabs());

        service.processRun(3, 2027, 999L);

        ArgumentCaptor<Payslip> captor = ArgumentCaptor.forClass(Payslip.class);
        verify(payslipRepository, org.mockito.Mockito.atLeastOnce()).save(captor.capture());
        Payslip saved = captor.getValue();

        // gross = 20000+8000+1600+2000 = 31600, no LOP
        assertEquals(new BigDecimal("31600.00"), saved.getGrossEarnings());
        // basic 20000 > 15000 ceiling -> PF employee capped at 1800
        assertEquals(new BigDecimal("1800.00"), saved.getPfEmployee());
        // gross 31600 > ESI ceiling 21000, not already contributing -> not applicable
        assertEquals(new BigDecimal("0.00"), saved.getEsiEmployee());
        // 31600 falls in the >10000 Maharashtra slab -> 200
        assertEquals(new BigDecimal("200.00"), saved.getProfessionalTax());
        // annualized gross 379200 - 75000 standard deduction = 304200, within 0% slab -> 0 tax
        assertEquals(new BigDecimal("0.00"), saved.getTds());
        // total deductions = 1800 + 0 + 200 + 0 = 2000; net pay = 31600 - 2000 = 29600
        assertEquals(new BigDecimal("2000.00"), saved.getTotalDeductions());
        assertEquals(new BigDecimal("29600.00"), saved.getNetPay());
    }

    @Test
    void processRun_midPeriodRaiseAboveEsiCeiling_alreadyContributing_stillDeductsEsi() throws Exception {
        // Under ESI Act: if employee enrolled at start of contribution period (Apr-Sep or Oct-Mar),
        // ESI deductions must continue for remainder of period even if gross wages exceed 21000 ceiling.
        PayrollRun run = new PayrollRun(7, 2026); // July 2026 -> Apr-Sep contribution period
        setId(run, 101L);
        when(payrollRunRepository.findByPeriodMonthAndPeriodYear(7, 2026)).thenReturn(Optional.of(run));
        when(payrollRunRepository.save(any(PayrollRun.class))).thenReturn(run);

        when(settingsRepository.findApplicableSettings(any(LocalDate.class)))
                .thenReturn(Optional.of(seededSettings()));
        when(tdsSlabRepository.findByFinancialYearOrderBySlabOrderAsc("2026-2027"))
                .thenReturn(fy2026_27Slabs());

        when(employeeDirectoryPort.findActiveEmployeeIds(any(LocalDate.class)))
                .thenReturn(List.of(EMPLOYEE_ID));
        when(employeeDirectoryPort.findPayrollProfile(EMPLOYEE_ID))
                .thenReturn(new EmployeePayrollProfile(EMPLOYEE_ID, "Test Employee", "Maharashtra", false,
                        LocalDate.of(2020, 1, 1), null));

        // Gross wages = 15000 + 6000 + 2000 + 2000 = 25000 (exceeds 21000 ceiling)
        when(salaryStructureLookupPort.findApplicable(eq(EMPLOYEE_ID), any(LocalDate.class)))
                .thenReturn(Optional.of(new SalaryStructureSnapshot(
                        10L,
                        new BigDecimal("15000.00"), new BigDecimal("6000.00"),
                        new BigDecimal("2000.00"), new BigDecimal("2000.00"), BigDecimal.ZERO)));

        when(attendanceLeavePort.summarize(eq(EMPLOYEE_ID), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(new AttendancePeriodSummary(31, new BigDecimal("31")));

        // Employee was contributing earlier in the current contribution period (Apr-Sep 2026)
        when(payslipRepository.existsEsiApplicablePriorInPeriod(eq(EMPLOYEE_ID), any(), any()))
                .thenReturn(true);
        when(payslipRepository.findByPayrollRunIdAndEmployeeId(101L, EMPLOYEE_ID))
                .thenReturn(Optional.empty());
        when(professionalTaxSlabRepository.findApplicableSlabs(eq("Maharashtra"), any(LocalDate.class)))
                .thenReturn(maharashtraSlabs());

        service.processRun(7, 2026, 999L);

        ArgumentCaptor<Payslip> captor = ArgumentCaptor.forClass(Payslip.class);
        verify(payslipRepository, org.mockito.Mockito.atLeastOnce()).save(captor.capture());
        Payslip saved = captor.getValue();

        assertEquals(new BigDecimal("25000.00"), saved.getGrossEarnings());
        // Basic 15000 -> PF = 1800
        assertEquals(new BigDecimal("1800.00"), saved.getPfEmployee());
        // Gross 25000 * 0.0075 = 187.50 ESI employee contribution (deducted because already contributing)
        assertEquals(new BigDecimal("187.50"), saved.getEsiEmployee());
        assertEquals(new BigDecimal("200.00"), saved.getProfessionalTax());
    }

    private PayrollStatutorySettings seededSettings() throws Exception {
        PayrollStatutorySettings s = newEntity(PayrollStatutorySettings.class);
        set(s, "pfEmployeeRate", new BigDecimal("0.1200"));
        set(s, "pfEmployerRate", new BigDecimal("0.1200"));
        set(s, "pfWageCeiling", new BigDecimal("15000.00"));
        set(s, "pfEpsRate", new BigDecimal("0.0833"));
        set(s, "pfEpsCeiling", new BigDecimal("1250.00"));
        set(s, "pfEdliRate", new BigDecimal("0.0050"));
        set(s, "pfAdminChargeRate", new BigDecimal("0.0050"));
        set(s, "pfAdminChargeMinimum", new BigDecimal("500.00"));
        set(s, "esiEmployeeRate", new BigDecimal("0.0075"));
        set(s, "esiEmployerRate", new BigDecimal("0.0325"));
        set(s, "esiWageCeiling", new BigDecimal("21000.00"));
        set(s, "tdsRegime", "NEW");
        set(s, "tdsStandardDeduction", new BigDecimal("75000.00"));
        set(s, "tdsCessRate", new BigDecimal("0.0400"));
        set(s, "tdsRebateThreshold", new BigDecimal("1200000.00"));
        set(s, "tdsRebateMaxAmount", new BigDecimal("60000.00"));
        return s;
    }

    private List<TdsSlab> fy2026_27Slabs() throws Exception {
        return List.of(
                slab(1, "0", "400000", "0.00"),
                slab(2, "400000", "800000", "0.05"),
                slab(3, "800000", "1200000", "0.10"),
                slab(4, "1200000", "1600000", "0.15"),
                slab(5, "1600000", "2000000", "0.20"),
                slab(6, "2000000", "2400000", "0.25")
        );
    }

    private TdsSlab slab(int order, String from, String to, String rate) throws Exception {
        TdsSlab s = newEntity(TdsSlab.class);
        set(s, "financialYear", "2026-2027");
        set(s, "slabOrder", order);
        set(s, "fromAmount", new BigDecimal(from));
        set(s, "toAmount", new BigDecimal(to));
        set(s, "rate", new BigDecimal(rate));
        return s;
    }

    private List<ProfessionalTaxSlab> maharashtraSlabs() throws Exception {
        return List.of(
                ptSlab("0", "7500", "0.00"),
                ptSlab("7500", "10000", "175.00"),
                ptSlabNoUpperBound("10000", "200.00")
        );
    }

    private ProfessionalTaxSlab ptSlab(String from, String to, String monthly) throws Exception {
        ProfessionalTaxSlab p = newEntity(ProfessionalTaxSlab.class);
        set(p, "state", "Maharashtra");
        set(p, "fromAmount", new BigDecimal(from));
        set(p, "toAmount", new BigDecimal(to));
        set(p, "monthlyAmount", new BigDecimal(monthly));
        set(p, "effectiveFrom", LocalDate.of(2026, 4, 1));
        return p;
    }

    private ProfessionalTaxSlab ptSlabNoUpperBound(String from, String monthly) throws Exception {
        ProfessionalTaxSlab p = newEntity(ProfessionalTaxSlab.class);
        set(p, "state", "Maharashtra");
        set(p, "fromAmount", new BigDecimal(from));
        set(p, "monthlyAmount", new BigDecimal(monthly));
        set(p, "effectiveFrom", LocalDate.of(2026, 4, 1));
        return p;
    }

    // Test-only reflection helpers: entities use protected no-arg constructors (JPA-only)
    // plus plain setters, and PayrollStatutorySettings/TdsSlab/ProfessionalTaxSlab don't
    // expose public setters for every field, so this avoids adding test-only
    // constructors/setters to the production entities just to make them buildable here.
    private <T> T newEntity(Class<T> clazz) throws Exception {
        Constructor<T> ctor = clazz.getDeclaredConstructor();
        ctor.setAccessible(true);
        return ctor.newInstance();
    }

    private void set(Object target, String field, Object value) throws Exception {
        Field f = target.getClass().getDeclaredField(field);
        f.setAccessible(true);
        f.set(target, value);
    }

    private void setId(PayrollRun run, Long id) throws Exception {
        set(run, "id", id);
    }
}