package com.staffdesk.ems.employee.dto;

import com.staffdesk.ems.employee.entity.Employee;

import java.time.LocalDate;

public record EmployeeResponseDto(
        Long id,
        String employeeCode,
        String firstName,
        String lastName,
        String email,
        String phone,
        Long departmentId,
        String departmentName,
        Long managerId,
        String managerName,
        String designation,
        LocalDate dateOfJoining,
        Employee.EmployeeStatus status,
        // Whether a matching row exists in `users` (i.e. this employee can log
        // in). Employees and their login accounts are created independently --
        // see EmployeeService -- so this has to be computed by the caller via
        // UserRepository.existsByEmployeeId(employee.getId()) and passed in;
        // it isn't derivable from the Employee entity alone.
        boolean hasLoginAccount
) {
    public static EmployeeResponseDto fromEntity(Employee e, boolean hasLoginAccount) {
        return new EmployeeResponseDto(
                e.getId(),
                e.getEmployeeCode(),
                e.getFirstName(),
                e.getLastName(),
                e.getEmail(),
                e.getPhone(),
                e.getDepartment() != null ? e.getDepartment().getId() : null,
                e.getDepartment() != null ? e.getDepartment().getName() : null,
                e.getManager() != null ? e.getManager().getId() : null,
                e.getManager() != null ? e.getManager().getFirstName() + " " + e.getManager().getLastName() : null,
                e.getDesignation(),
                e.getDateOfJoining(),
                e.getStatus(),
                hasLoginAccount
        );
    }
}