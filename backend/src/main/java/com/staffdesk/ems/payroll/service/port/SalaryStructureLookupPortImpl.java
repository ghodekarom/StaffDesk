package com.staffdesk.ems.payroll.service.port;

import com.staffdesk.ems.payroll.entity.SalaryStructure;
import com.staffdesk.ems.payroll.repository.SalaryStructureRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Bridges to the real SalaryStructureRepository/entity from step 2.
 *
 * LIMITATION: SalaryStructureRepository only exposes "the currently open structure"
 * (effective_to IS NULL) — there's no method to fetch the structure that was
 * effective as of an arbitrary past date. So periodDate is currently ignored; this
 * always returns the employee's latest structure regardless of which period is
 * being processed. That's correct for running payroll on the current/most recent
 * month, but WRONG for reprocessing a historical period after a mid-period salary
 * revision. Add a date-ranged query to SalaryStructureRepository
 * (effective_from <= :date AND (effective_to IS NULL OR effective_to >= :date))
 * before relying on this for back-dated runs.
 */
@Component
public class SalaryStructureLookupPortImpl implements SalaryStructureLookupPort {

    private final SalaryStructureRepository salaryStructureRepository;

    public SalaryStructureLookupPortImpl(SalaryStructureRepository salaryStructureRepository) {
        this.salaryStructureRepository = salaryStructureRepository;
    }

    @Override
    public Optional<SalaryStructureSnapshot> findApplicable(Long employeeId, LocalDate periodDate) {
        return salaryStructureRepository.findByEmployeeIdAndEffectiveToIsNull(employeeId)
                .map(this::toSnapshot);
    }

    private SalaryStructureSnapshot toSnapshot(SalaryStructure s) {
        return new SalaryStructureSnapshot(
                s.getId(),
                s.getBasic(),
                s.getHra(),
                s.getConveyanceAllowance(),
                s.getSpecialAllowance(),
                s.getOtherAllowance());
    }
}
