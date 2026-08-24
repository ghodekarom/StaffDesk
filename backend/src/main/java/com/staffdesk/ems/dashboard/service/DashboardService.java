package com.staffdesk.ems.dashboard.service;

import com.staffdesk.ems.attendance.entity.Attendance;
import com.staffdesk.ems.attendance.repository.AttendanceRepository;
import com.staffdesk.ems.dashboard.dto.DashboardSummaryResponse;
import com.staffdesk.ems.department.repository.DepartmentRepository;
import com.staffdesk.ems.employee.entity.Employee;
import com.staffdesk.ems.employee.repository.EmployeeRepository;
import com.staffdesk.ems.leave.entity.LeaveRequest;
import com.staffdesk.ems.leave.repository.LeaveRequestRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    // Matches the 5-weekday window the old client-side mock used (Mon-Fri),
    // but every point now comes from a real GROUP BY instead of a formula.
    private static final int TREND_DAYS = 7;

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    public DashboardService(EmployeeRepository employeeRepository,
                            DepartmentRepository departmentRepository,
                            AttendanceRepository attendanceRepository,
                            LeaveRequestRepository leaveRequestRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(Long currentEmployeeId, boolean canReviewTeam) {
        LocalDate today = LocalDate.now();
        LocalDate firstOfMonth = today.withDayOfMonth(1);
        LocalDate trendStart = today.minusDays(TREND_DAYS - 1);

        long pendingLeaveCount = canReviewTeam
                ? leaveRequestRepository.findByStatus(LeaveRequest.LeaveStatus.PENDING, PageRequest.of(0, 1))
                .getTotalElements()
                : leaveRequestRepository.findByEmployeeIdAndStatus(
                        currentEmployeeId, LeaveRequest.LeaveStatus.PENDING, PageRequest.of(0, 1))
                .getTotalElements();

        // Issue #15: everything below used to run unconditionally, so an
        // EMPLOYEE saw the exact same company-wide numbers as ADMIN/HR/MANAGER
        // (headcount, department breakdown, attendance trend, etc). Only
        // canReviewTeam callers get those org-wide aggregates now; EMPLOYEE
        // gets zeroed/empty values here, the same way pendingLeaveCount
        // already branched. Which (if any) of these should stay visible to
        // EMPLOYEE at an individual-safe level (e.g. a general "present
        // today" count) is a product decision noted in the issue -- swap the
        // relevant zero below for a real scoped query if/when that's decided.
        if (!canReviewTeam) {
            return new DashboardSummaryResponse(
                    0L, 0L, 0L,
                    0L, 0L, 0L, 0.0,
                    pendingLeaveCount, List.of(), List.of());
        }

        long totalEmployees = employeeRepository.countByStatus(Employee.EmployeeStatus.ACTIVE);
        long newHires = employeeRepository.countByStatusAndDateOfJoiningGreaterThanEqual(
                Employee.EmployeeStatus.ACTIVE, firstOfMonth);
        long totalDepartments = departmentRepository.count();

        long presentToday = attendanceRepository.countByAttendanceDateAndStatus(today, Attendance.Status.PRESENT);
        long absentToday = attendanceRepository.countByAttendanceDateAndStatus(today, Attendance.Status.ABSENT);
        long lateToday = attendanceRepository.countByAttendanceDateAndStatus(today, Attendance.Status.LATE);

        Double workedSeconds = attendanceRepository.sumWorkedSecondsForDate(today);
        double hoursLoggedToday = Math.round((workedSeconds != null ? workedSeconds : 0.0) / 3600.0 * 10.0) / 10.0;

        List<DashboardSummaryResponse.DepartmentHeadcountDto> departmentBreakdown =
                employeeRepository.countActiveGroupedByDepartment().stream()
                        .map(row -> new DashboardSummaryResponse.DepartmentHeadcountDto(row.getName(), row.getTotal()))
                        .collect(Collectors.toList());

        List<DashboardSummaryResponse.DailyAttendanceDto> attendanceTrend =
                buildAttendanceTrend(trendStart, today);

        return new DashboardSummaryResponse(
                totalEmployees, newHires, totalDepartments,
                presentToday, absentToday, lateToday, hoursLoggedToday,
                pendingLeaveCount, departmentBreakdown, attendanceTrend);
    }

    // The repository query only returns rows for (date, status) pairs that
    // actually exist -- a day with zero LATE records has no LATE row at all.
    // Reshape into one dense entry per calendar day so the frontend chart
    // never has to guess at missing days.
    private List<DashboardSummaryResponse.DailyAttendanceDto> buildAttendanceTrend(LocalDate from, LocalDate to) {
        Map<LocalDate, Map<Attendance.Status, Long>> byDate = new LinkedHashMap<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            byDate.put(d, new LinkedHashMap<>());
        }
        for (var row : attendanceRepository.countByDateAndStatusBetween(from, to)) {
            byDate.computeIfAbsent(row.getAttendanceDate(), k -> new LinkedHashMap<>())
                    .put(row.getStatus(), row.getTotal());
        }

        return byDate.entrySet().stream()
                .map(entry -> {
                    Map<Attendance.Status, Long> counts = entry.getValue();
                    String label = entry.getKey().getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
                    return new DashboardSummaryResponse.DailyAttendanceDto(
                            label,
                            counts.getOrDefault(Attendance.Status.PRESENT, 0L),
                            counts.getOrDefault(Attendance.Status.ABSENT, 0L),
                            counts.getOrDefault(Attendance.Status.LATE, 0L),
                            counts.getOrDefault(Attendance.Status.HALF_DAY, 0L));
                })
                .collect(Collectors.toList());
    }
}