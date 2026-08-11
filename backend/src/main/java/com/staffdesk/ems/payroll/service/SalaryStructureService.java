package com.staffdesk.ems.payroll.service;

import com.staffdesk.ems.employee.entity.Employee;
import com.staffdesk.ems.employee.repository.EmployeeRepository;
import com.staffdesk.ems.payroll.dto.SalaryStructureCreateRequest;
import com.staffdesk.ems.payroll.dto.SalaryStructureResponse;
import com.staffdesk.ems.payroll.entity.SalaryStructure;
import com.staffdesk.ems.payroll.repository.SalaryStructureRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SalaryStructureService {

    private final SalaryStructureRepository salaryStructureRepository;
    private final EmployeeRepository employeeRepository;

    public SalaryStructureService(SalaryStructureRepository salaryStructureRepository,
                                   EmployeeRepository employeeRepository) {
        this.salaryStructureRepository = salaryStructureRepository;
        this.employeeRepository = employeeRepository;
    }

    /**
     * Creates a new salary structure revision for an employee. If a currently-active
     * structure exists, it is closed out (effective_to set to the day before the new
     * structure's effective_from) rather than updated in place, since a payslip may
     * already reference it by id.
     */
    @Transactional
    public SalaryStructureResponse createRevision(Long actingEmployeeId, SalaryStructureCreateRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new EmployeeNotFoundForPayrollException(request.getEmployeeId()));

        salaryStructureRepository.findByEmployeeIdAndEffectiveToIsNull(request.getEmployeeId())
                .ifPresent(currentStructure -> closeOutCurrent(currentStructure, request.getEffectiveFrom()));

        Employee actor = actingEmployeeId != null
                ? employeeRepository.findById(actingEmployeeId).orElse(null)
                : null;

        SalaryStructure structure = new SalaryStructure();
        structure.setEmployee(employee);
        structure.setBasic(request.getBasic());
        structure.setHra(request.getHra());
        structure.setConveyanceAllowance(request.getConveyanceAllowance());
        structure.setSpecialAllowance(request.getSpecialAllowance());
        structure.setOtherAllowance(request.getOtherAllowance());
        structure.setCtcAnnual(request.getCtcAnnual());
        structure.setEffectiveFrom(request.getEffectiveFrom());
        structure.setCreatedBy(actor);

        SalaryStructure saved = salaryStructureRepository.save(structure);
        return SalaryStructureResponse.from(saved);
    }

    private void closeOutCurrent(SalaryStructure currentStructure, java.time.LocalDate newEffectiveFrom) {
        if (!newEffectiveFrom.isAfter(currentStructure.getEffectiveFrom())) {
            throw new InvalidSalaryStructureException(
                    "New effective-from date (" + newEffectiveFrom + ") must be after the current "
                            + "structure's effective-from date (" + currentStructure.getEffectiveFrom() + ")");
        }
        currentStructure.setEffectiveTo(newEffectiveFrom.minusDays(1));
        salaryStructureRepository.save(currentStructure);
    }

    @Transactional(readOnly = true)
    public SalaryStructureResponse getCurrent(Long employeeId) {
        SalaryStructure current = salaryStructureRepository.findByEmployeeIdAndEffectiveToIsNull(employeeId)
                .orElseThrow(() -> new SalaryStructureNotFoundException(employeeId));
        return SalaryStructureResponse.from(current);
    }

    @Transactional(readOnly = true)
    public Page<SalaryStructureResponse> getHistory(Long employeeId, Pageable pageable) {
        return salaryStructureRepository
                .findByEmployeeIdOrderByEffectiveFromDesc(employeeId, pageable)
                .map(SalaryStructureResponse::from);
    }
}
