package com.staffdesk.ems.department.dto;

import java.time.Instant;

public class DepartmentResponse {

    private Long id;
    private String name;
    private Long headEmployeeId;
    private String headEmployeeName; // null if no head assigned, or if lookup fails
    private long employeeCount;
    private Instant createdAt;
    private Instant updatedAt;

    public DepartmentResponse(Long id, String name, Long headEmployeeId, String headEmployeeName,
                               long employeeCount, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.name = name;
        this.headEmployeeId = headEmployeeId;
        this.headEmployeeName = headEmployeeName;
        this.employeeCount = employeeCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Long getHeadEmployeeId() {
        return headEmployeeId;
    }

    public String getHeadEmployeeName() {
        return headEmployeeName;
    }

    public long getEmployeeCount() {
        return employeeCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
