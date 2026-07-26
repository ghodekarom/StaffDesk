package com.staffdesk.ems.department.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class DepartmentRequest {

    @NotBlank(message = "Department name is required")
    @Size(max = 100, message = "Department name must be 100 characters or fewer")
    private String name;

    // Optional — must reference an existing, active employee. Validated in the service layer
    // since that check requires a cross-module lookup, not just a bean constraint.
    private Long headEmployeeId;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getHeadEmployeeId() {
        return headEmployeeId;
    }

    public void setHeadEmployeeId(Long headEmployeeId) {
        this.headEmployeeId = headEmployeeId;
    }
}
