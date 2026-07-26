package com.staffdesk.ems.department.service;

import com.staffdesk.ems.employee.entity.Employee; // ADJUST if your Employee entity lives elsewhere
import com.staffdesk.ems.employee.repository.EmployeeRepository; // ADJUST if named/located differently
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * ============================================================================
 * ADJUST THIS FILE to match your actual Employee module.
 *
 * Assumptions made here (from the project's documented package structure,
 * com.staffdesk.ems.employee.*, and the Phase 1 DB schema's employees table):
 *   - Employee entity:    com.staffdesk.ems.employee.entity.Employee
 *   - Repository:         com.staffdesk.ems.employee.repository.EmployeeRepository
 *   - Employee has:       getId(), getFirstName(), getLastName(), getStatus()
 *   - Status is an enum/string with an "ACTIVE" value (per the CHECK constraint
 *     on employees.status in the Phase 1 schema)
 *
 * If any of the above doesn't match your real EmployeeRepository, this is the
 * only file you need to edit — DepartmentService and the controller don't
 * need to change.
 * ============================================================================
 */
@Service
public class EmployeeLookupServiceImpl implements EmployeeLookupService {

    private final EmployeeRepository employeeRepository;

    public EmployeeLookupServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public Optional<EmployeeSummary> findSummary(Long employeeId) {
        if (employeeId == null) {
            return Optional.empty();
        }
        return employeeRepository.findById(employeeId)
                .map(emp -> new EmployeeSummary(emp.getId(), emp.getFirstName() + " " + emp.getLastName()));
    }

    @Override
    public long countByDepartmentId(Long departmentId) {
        // ADJUST: if EmployeeRepository doesn't have this method yet, add:
        //   long countByDepartmentId(Long departmentId);
        // to your EmployeeRepository interface (Spring Data derives it automatically).
        return employeeRepository.countByDepartmentId(departmentId);
    }

    @Override
    public boolean existsAndActive(Long employeeId) {
        if (employeeId == null) {
            return true; // null head is allowed — nothing to validate
        }
        return employeeRepository.findById(employeeId)
                .map(emp -> "ACTIVE".equalsIgnoreCase(emp.getStatus().toString()))
                .orElse(false);
    }
}
