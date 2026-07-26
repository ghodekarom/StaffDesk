package com.staffdesk.ems.employee.service;

import com.staffdesk.ems.common.exception.DuplicateResourceException;
import com.staffdesk.ems.common.exception.ResourceNotFoundException;
import com.staffdesk.ems.department.entity.Department;
import com.staffdesk.ems.department.repository.DepartmentRepository;
import com.staffdesk.ems.employee.dto.EmployeeRequestDto;
import com.staffdesk.ems.employee.dto.EmployeeResponseDto;
import com.staffdesk.ems.employee.entity.Employee;
import com.staffdesk.ems.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

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
        return EmployeeResponseDto.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponseDto getById(Long id) {
        Employee employee = findEmployeeOrThrow(id);
        return EmployeeResponseDto.fromEntity(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeResponseDto> getAll(Pageable pageable) {
        return employeeRepository.findAll(pageable).map(EmployeeResponseDto::fromEntity);
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
                .map(EmployeeResponseDto::fromEntity);
    }

    @Override
    public EmployeeResponseDto update(Long id, EmployeeRequestDto request) {
        Employee employee = findEmployeeOrThrow(id);

        if (employeeRepository.existsByEmailAndIdNot(request.email(), id)) {
            throw new DuplicateResourceException("An employee with email " + request.email() + " already exists");
        }

        applyRequestToEntity(request, employee);
        Employee saved = employeeRepository.save(employee);
        return EmployeeResponseDto.fromEntity(saved);
    }

    @Override
    public void delete(Long id) {
        Employee employee = findEmployeeOrThrow(id);
        employeeRepository.delete(employee);
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
}