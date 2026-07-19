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
        Employee.EmployeeStatus status
) {
    public static EmployeeResponseDto fromEntity(Employee e) {
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
                e.getStatus()
        );
    }
}
