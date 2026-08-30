package com.staffdesk.ems.employee.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;

public record EmployeeRequestDto(

        @NotBlank(message = "employee code is required")
        String employeeCode,

        @NotBlank(message = "first name is required")
        String firstName,

        @NotBlank(message = "last name is required")
        String lastName,

        @NotBlank(message = "email is required")
        @Email(message = "email must be a valid email address")
        String email,

        String phone,

        Long departmentId,

        Long managerId,

        String designation,

        @NotNull(message = "date of joining is required")
        @PastOrPresent(message = "date of joining cannot be in the future")
        LocalDate dateOfJoining,

        // Indian state for Professional Tax calculation (e.g. "Maharashtra",
        // "Karnataka"). Nullable — existing employees may not have one yet.
        String workState
) {
}
