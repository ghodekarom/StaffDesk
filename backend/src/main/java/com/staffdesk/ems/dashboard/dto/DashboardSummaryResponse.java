package com.staffdesk.ems.dashboard.dto;

import java.util.List;

/**
 * Everything the Overview page needs, aggregated server-side in one round
 * trip. Every field here is a real query result — no client-side
 * randomness, formulas, or hardcoded fallbacks. If a number can't be
 * computed (e.g. no attendance rows yet today), it comes back as 0, and
 * the frontend is expected to render its existing EmptyState for that
 * section rather than substituting a fake value.
 */
public class DashboardSummaryResponse {

    private final long totalEmployees;
    private final long newHiresThisMonth;
    private final long totalDepartments;
    private final long presentToday;
    private final long absentToday;
    private final long lateToday;
    private final double hoursLoggedToday;
    private final long pendingLeaveCount;
    private final List<DepartmentHeadcountDto> departmentBreakdown;
    private final List<DailyAttendanceDto> attendanceTrend;

    public DashboardSummaryResponse(long totalEmployees, long newHiresThisMonth, long totalDepartments,
                                    long presentToday, long absentToday, long lateToday,
                                    double hoursLoggedToday, long pendingLeaveCount,
                                    List<DepartmentHeadcountDto> departmentBreakdown,
                                    List<DailyAttendanceDto> attendanceTrend) {
        this.totalEmployees = totalEmployees;
        this.newHiresThisMonth = newHiresThisMonth;
        this.totalDepartments = totalDepartments;
        this.presentToday = presentToday;
        this.absentToday = absentToday;
        this.lateToday = lateToday;
        this.hoursLoggedToday = hoursLoggedToday;
        this.pendingLeaveCount = pendingLeaveCount;
        this.departmentBreakdown = departmentBreakdown;
        this.attendanceTrend = attendanceTrend;
    }

    public long getTotalEmployees() {
        return totalEmployees;
    }

    public long getNewHiresThisMonth() {
        return newHiresThisMonth;
    }

    public long getTotalDepartments() {
        return totalDepartments;
    }

    public long getPresentToday() {
        return presentToday;
    }

    public long getAbsentToday() {
        return absentToday;
    }

    public long getLateToday() {
        return lateToday;
    }

    public double getHoursLoggedToday() {
        return hoursLoggedToday;
    }

    public long getPendingLeaveCount() {
        return pendingLeaveCount;
    }

    public List<DepartmentHeadcountDto> getDepartmentBreakdown() {
        return departmentBreakdown;
    }

    public List<DailyAttendanceDto> getAttendanceTrend() {
        return attendanceTrend;
    }

    public record DepartmentHeadcountDto(String name, long employeeCount) {
    }

    public record DailyAttendanceDto(String date, long present, long absent, long late, long halfDay) {
    }
}