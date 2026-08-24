package com.staffdesk.ems.employee.service;

import com.staffdesk.ems.employee.dto.EmployeeRequestDto;
import com.staffdesk.ems.employee.dto.EmployeeResponseDto;
import com.staffdesk.ems.employee.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmployeeService {

    EmployeeResponseDto create(EmployeeRequestDto request);

    EmployeeResponseDto getById(Long id);

    Page<EmployeeResponseDto> getAll(Pageable pageable);

    Page<EmployeeResponseDto> search(String search, Pageable pageable);

    EmployeeResponseDto update(Long id, EmployeeRequestDto request);

    // Despite the name (kept for API/route compatibility), this deactivates
    // the employee (status -> INACTIVE) rather than deleting the row. See
    // EmployeeServiceImpl for the rationale.
    void delete(Long id);

    // General status transition (ACTIVE/INACTIVE/TERMINATED), for reactivating
    // someone or marking them terminated -- distinct from delete()'s one-way
    // "deactivate" convenience action. Unlike delete(), this is idempotent:
    // setting a status an employee already has just succeeds.
    EmployeeResponseDto updateStatus(Long id, Employee.EmployeeStatus status);

    // Issue #1: EMPLOYEE-role scoped equivalents of getById/search, used by
    // EmployeeController when the caller has no ADMIN/HR/MANAGER role.
    // Implemented in EmployeeServiceImpl, mirroring getById()/search():
    // ResourceNotFoundException.forEntity("Employee", id) and
    // EmployeeResponseDto.fromEntity(employee, hasLoginAccount), just
    // pre-filtered to one department via EmployeeRepository's new
    // findByIdAndDepartmentId / searchByDepartment.
    EmployeeResponseDto getByIdScoped(Long id, Long departmentId);

    Page<EmployeeResponseDto> searchInDepartment(String search, Long departmentId, Pageable pageable);
}