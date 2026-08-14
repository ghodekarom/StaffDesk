package com.staffdesk.ems.payroll.service.port;

import com.staffdesk.ems.employee.entity.Employee;
import com.staffdesk.ems.employee.repository.EmployeeRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Bridges to the real Employee entity/repository. Uses only findAll()/findById()/
 * findAllById() (all inherited from JpaRepository regardless of what custom query
 * methods EmployeeRepository does or doesn't define) — deliberately not guessing at
 * derived query method names that might not exist there.
 *
 * KNOWN GAPS, both because Employee has no matching column:
 *  - hasDisability is always false (no such field on Employee yet).
 *  - dateOfExit is always null (Employee only has a status enum — ACTIVE/INACTIVE/
 *    TERMINATED — not an actual exit date column). If §7.5 (joiner/leaver proration)
 *    needs an exact exit date, Employee needs a column for it.
 */
@Component
public class EmployeeDirectoryPortImpl implements EmployeeDirectoryPort {

    private final EmployeeRepository employeeRepository;

    public EmployeeDirectoryPortImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public List<Long> findActiveEmployeeIds(LocalDate periodDate) {
        System.out.println("Total employees in DB: " + employeeRepository.count());
        return employeeRepository.findAll().stream()
                .filter(e -> e.getStatus() == Employee.EmployeeStatus.ACTIVE)
                .map(Employee::getId)
                .toList();
    }

    @Override
    public EmployeePayrollProfile findPayrollProfile(Long employeeId) {
        Employee e = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + employeeId));
        return toProfile(e);
    }

    @Override
    public Map<Long, EmployeePayrollProfile> findPayrollProfiles(List<Long> employeeIds) {
        // findAllById is a single IN-clause query, regardless of list size — this is
        // the whole point of this method existing (see interface Javadoc): avoid one
        // query per payslip when resolving names for a run's worth of rows.
        return employeeRepository.findAllById(employeeIds).stream()
                .collect(Collectors.toMap(Employee::getId, this::toProfile, (a, b) -> a));
    }

    private EmployeePayrollProfile toProfile(Employee e) {
        String displayName = e.getFirstName() + " " + e.getLastName();

        return new EmployeePayrollProfile(
                e.getId(),
                displayName,
                e.getWorkState(),
                false,     // hasDisability — no column yet, see class Javadoc
                e.getDateOfJoining(),
                null);     // dateOfExit — no column yet, see class Javadoc
    }
}