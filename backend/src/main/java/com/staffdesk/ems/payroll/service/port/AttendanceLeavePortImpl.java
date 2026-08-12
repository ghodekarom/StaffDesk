package com.staffdesk.ems.payroll.service.port;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * PLACEHOLDER — NOT the real §7.3 LOP logic. This exists only to satisfy
 * PayrollRunService's dependency so the app boots; it assumes every day in the
 * period is fully paid (no LOP at all), regardless of actual Attendance/LeaveRequest
 * data.
 *
 * Replace this once the real Attendance/LeaveRequest repositories are confirmed —
 * it needs, at minimum: a way to count PRESENT/HALF_DAY days from Attendance for an
 * employee within a date range, and a way to count APPROVED LeaveRequest days
 * within that range, so workingDays/paidDays reflect real LOP per the assumption
 * documented on AttendanceLeavePort itself (no attendance + no approved leave = LOP).
 */
@Component
public class AttendanceLeavePortImpl implements AttendanceLeavePort {

    @Override
    public AttendancePeriodSummary summarize(Long employeeId, LocalDate periodStart, LocalDate periodEnd) {
        int workingDays = (int) ChronoUnit.DAYS.between(periodStart, periodEnd) + 1;
        return new AttendancePeriodSummary(workingDays, BigDecimal.valueOf(workingDays));
    }
}
