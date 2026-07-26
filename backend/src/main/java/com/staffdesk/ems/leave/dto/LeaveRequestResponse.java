package com.staffdesk.ems.leave.dto;

import com.staffdesk.ems.leave.entity.LeaveRequest;

import java.time.Instant;
import java.time.LocalDate;

public class LeaveRequestResponse {

    private Long id;
    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private LeaveRequest.LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private long days;
    private LeaveRequest.LeaveStatus status;
    private Long approvedById;
    private String approvedByName; // null if not yet decided
    private String reason;
    private Instant createdAt;
    private Instant updatedAt;

    public LeaveRequestResponse(Long id, Long employeeId, String employeeCode, String employeeName,
                                 LeaveRequest.LeaveType leaveType, LocalDate startDate, LocalDate endDate,
                                 long days, LeaveRequest.LeaveStatus status, Long approvedById,
                                 String approvedByName, String reason, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.employeeId = employeeId;
        this.employeeCode = employeeCode;
        this.employeeName = employeeName;
        this.leaveType = leaveType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.days = days;
        this.status = status;
        this.approvedById = approvedById;
        this.approvedByName = approvedByName;
        this.reason = reason;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static LeaveRequestResponse from(LeaveRequest lr) {
        var employee = lr.getEmployee();
        var approver = lr.getApprovedBy();
        long days = java.time.temporal.ChronoUnit.DAYS.between(lr.getStartDate(), lr.getEndDate()) + 1;

        return new LeaveRequestResponse(
                lr.getId(),
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getFirstName() + " " + employee.getLastName(),
                lr.getLeaveType(),
                lr.getStartDate(),
                lr.getEndDate(),
                days,
                lr.getStatus(),
                approver != null ? approver.getId() : null,
                approver != null ? approver.getFirstName() + " " + approver.getLastName() : null,
                lr.getReason(),
                lr.getCreatedAt(),
                lr.getUpdatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public LeaveRequest.LeaveType getLeaveType() {
        return leaveType;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public long getDays() {
        return days;
    }

    public LeaveRequest.LeaveStatus getStatus() {
        return status;
    }

    public Long getApprovedById() {
        return approvedById;
    }

    public String getApprovedByName() {
        return approvedByName;
    }

    public String getReason() {
        return reason;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
