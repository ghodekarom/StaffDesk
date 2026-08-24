package com.staffdesk.ems.employee.service;

import com.staffdesk.ems.auth.repository.UserRepository;
import com.staffdesk.ems.common.exception.DuplicateResourceException;
import com.staffdesk.ems.common.exception.ResourceNotFoundException;
import com.staffdesk.ems.department.entity.Department;
import com.staffdesk.ems.department.repository.DepartmentRepository;
import com.staffdesk.ems.employee.dto.EmployeeRequestDto;
import com.staffdesk.ems.employee.dto.EmployeeResponseDto;
import com.staffdesk.ems.employee.entity.Employee;
import com.staffdesk.ems.employee.repository.EmployeeRepository;
import com.staffdesk.ems.leave.service.LeaveBalanceProvisioningService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Year;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final LeaveBalanceProvisioningService leaveBalanceProvisioningService;

    @Override
    public EmployeeResponseDto create(EmployeeRequestDto request) {
        if (employeeRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("An employee with email " + request.email() + " already exists");
        }
        if (employeeRepository.existsByEmployeeCode(request.employeeCode())) {
            throw new DuplicateResourceException("Employee code " + request.employeeCode() + " is already in use");
        }

        Employee employee = new Employee();
        applyRequestToEntity(request, employee);

        Employee saved = employeeRepository.save(employee);

        // Without this, a new hire has no leave_balances row at all, and
        // GET /leave/balances/me comes back empty while POST /leave/requests
        // fails with InsufficientLeaveBalanceException on every leave type --
        // see leave-balance-provisioning-issue.md (#9). Defaults match
        // V2__seed_data.sql exactly.
        leaveBalanceProvisioningService.ensureBalancesExist(saved, Year.now().getValue());

        // A freshly created employee can never already have a login account --
        // that's a separate step via POST /auth/register -- so this is always false.
        return EmployeeResponseDto.fromEntity(saved, false);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponseDto getById(Long id) {
        Employee employee = findEmployeeOrThrow(id);
        return EmployeeResponseDto.fromEntity(employee, userRepository.existsByEmployeeId(employee.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeResponseDto> getAll(Pageable pageable) {
        return employeeRepository.findAll(pageable)
                .map(e -> EmployeeResponseDto.fromEntity(e, userRepository.existsByEmployeeId(e.getId())));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeResponseDto> search(String search, Pageable pageable) {
        if (!StringUtils.hasText(search)) {
            return getAll(pageable);
        }
        return employeeRepository
                .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmployeeCodeContainingIgnoreCase(
                        search, search, search, pageable)
                .map(e -> EmployeeResponseDto.fromEntity(e, userRepository.existsByEmployeeId(e.getId())));
    }

    @Override
    public EmployeeResponseDto update(Long id, EmployeeRequestDto request) {
        Employee employee = findEmployeeOrThrow(id);

        if (employeeRepository.existsByEmailAndIdNot(request.email(), id)) {
            throw new DuplicateResourceException("An employee with email " + request.email() + " already exists");
        }

        applyRequestToEntity(request, employee);
        Employee saved = employeeRepository.save(employee);
        return EmployeeResponseDto.fromEntity(saved, userRepository.existsByEmployeeId(saved.getId()));
    }

    @Override
    public void delete(Long id) {
        // Deactivation, not a hard delete: employees have FK-referenced history
        // (attendance, leave, payroll, messages, ...) that a real DELETE would
        // either cascade-destroy or crash on with a FK violation. Setting
        // status to INACTIVE preserves that history and removes the employee
        // from active views (dashboards, directories, "who's working today")
        // without destroying data. See employee-delete-safety-issue.md.
        Employee employee = findEmployeeOrThrow(id);

        if (employee.getStatus() == Employee.EmployeeStatus.INACTIVE) {
            throw new IllegalArgumentException("Employee " + id + " is already inactive");
        }

        employee.setStatus(Employee.EmployeeStatus.INACTIVE);
        employeeRepository.save(employee);
    }

    @Override
    public EmployeeResponseDto updateStatus(Long id, Employee.EmployeeStatus status) {
        Employee employee = findEmployeeOrThrow(id);
        employee.setStatus(status);
        Employee saved = employeeRepository.save(employee);
        return EmployeeResponseDto.fromEntity(saved, userRepository.existsByEmployeeId(saved.getId()));
    }

    private Employee findEmployeeOrThrow(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("Employee", id));
    }

    private void applyRequestToEntity(EmployeeRequestDto request, Employee employee) {
        employee.setEmployeeCode(request.employeeCode());
        employee.setFirstName(request.firstName());
        employee.setLastName(request.lastName());
        employee.setEmail(request.email());
        employee.setPhone(request.phone());
        employee.setDesignation(request.designation());
        employee.setDateOfJoining(request.dateOfJoining());

        if (request.departmentId() != null) {
            Department department = departmentRepository.findById(request.departmentId())
                    .orElseThrow(() -> ResourceNotFoundException.forEntity("Department", request.departmentId()));
            employee.setDepartment(department);
        } else {
            employee.setDepartment(null);
        }

        if (request.managerId() != null) {
            Employee manager = employeeRepository.findById(request.managerId())
                    .orElseThrow(() -> ResourceNotFoundException.forEntity("Manager (employee)", request.managerId()));
            employee.setManager(manager);
        } else {
            employee.setManager(null);
        }
    }
    // Issue #1: EMPLOYEE-role scoped equivalents of getById/search, used by
    // EmployeeController when the caller has no ADMIN/HR/MANAGER role.
    // Implement in EmployeeServiceImpl using
    // EmployeeRepository#findByIdAndDepartmentId / #searchByDepartment
    // (added to EmployeeRepository), e.g.:

       public EmployeeResponseDto getByIdScoped(Long id, Long departmentId) {
           Employee employee = employeeRepository.findByIdAndDepartmentId(id, departmentId)
                   .orElseThrow(() -> new EmployeeNotFoundException(id));
           return EmployeeResponseDto.from(employee);
       }

       public Page<EmployeeResponseDto> searchInDepartment(String search, Long departmentId, Pageable pageable) {
           return employeeRepository.searchByDepartment(departmentId, search, pageable)
                   .map(EmployeeResponseDto::from);
       }
}