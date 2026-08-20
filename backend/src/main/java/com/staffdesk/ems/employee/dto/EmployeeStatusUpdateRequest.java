package com.staffdesk.ems.employee.dto;

import com.staffdesk.ems.employee.entity.Employee;
import jakarta.validation.constraints.NotNull;

public record EmployeeStatusUpdateRequest(

        @NotNull(message = "status is required")
        Employee.EmployeeStatus status
) {
}