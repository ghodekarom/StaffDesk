package com.staffdesk.ems.leave.dto;

import com.staffdesk.ems.leave.entity.LeaveBalance;
import com.staffdesk.ems.leave.entity.LeaveRequest;

import java.math.BigDecimal;

public class LeaveBalanceResponse {

    private Long id;
    private Long employeeId;
    private LeaveRequest.LeaveType leaveType;
    private Integer year;
    private BigDecimal total;
    private BigDecimal used;
    private BigDecimal remaining;

    public LeaveBalanceResponse(Long id, Long employeeId, LeaveRequest.LeaveType leaveType, Integer year,
                                 BigDecimal total, BigDecimal used, BigDecimal remaining) {
        this.id = id;
        this.employeeId = employeeId;
        this.leaveType = leaveType;
        this.year = year;
        this.total = total;
        this.used = used;
        this.remaining = remaining;
    }

    public static LeaveBalanceResponse from(LeaveBalance balance) {
        return new LeaveBalanceResponse(
                balance.getId(),
                balance.getEmployee().getId(),
                balance.getLeaveType(),
                balance.getYear(),
                balance.getTotal(),
                balance.getUsed(),
                balance.getRemaining()
        );
    }

    public Long getId() {
        return id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public LeaveRequest.LeaveType getLeaveType() {
        return leaveType;
    }

    public Integer getYear() {
        return year;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public BigDecimal getUsed() {
        return used;
    }

    public BigDecimal getRemaining() {
        return remaining;
    }
}
