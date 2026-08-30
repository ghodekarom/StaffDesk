package com.staffdesk.ems.dashboard.service;

import com.staffdesk.ems.attendance.entity.Attendance;
import com.staffdesk.ems.attendance.repository.AttendanceRepository;
import com.staffdesk.ems.dashboard.dto.DashboardSummaryResponse;
import com.staffdesk.ems.department.repository.DepartmentRepository;
import com.staffdesk.ems.employee.entity.Employee;
import com.staffdesk.ems.employee.repository.EmployeeRepository;
import com.staffdesk.ems.leave.entity.LeaveRequest;
import com.staffdesk.ems.leave.repository.LeaveRequestRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private LeaveRequestRepository leaveRequestRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void getSummary_returnsZeroedOrgMetrics_whenCanReviewTeamIsFalse() {
        when(leaveRequestRepository.findByEmployeeIdAndStatus(eq(1L), eq(LeaveRequest.LeaveStatus.PENDING), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(new LeaveRequest()), PageRequest.of(0, 1), 2L));

        DashboardSummaryResponse response = dashboardService.getSummary(1L, false, "week");

        assertThat(response.getTotalEmployees()).isEqualTo(0L);
        assertThat(response.getTotalDepartments()).isEqualTo(0L);
        assertThat(response.getPresentToday()).isEqualTo(0L);
        assertThat(response.getPendingLeaveCount()).isEqualTo(2L);
        assertThat(response.getDepartmentBreakdown()).isEmpty();
        assertThat(response.getAppliedRange()).isEqualTo("week");
    }

    @Test
    void getSummary_returnsFullOrgMetrics_whenCanReviewTeamIsTrue() {
        when(leaveRequestRepository.findByStatus(eq(LeaveRequest.LeaveStatus.PENDING), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 1), 5L));

        when(employeeRepository.countByStatus(Employee.EmployeeStatus.ACTIVE)).thenReturn(100L);
        when(employeeRepository.countByStatusAndDateOfJoiningGreaterThanEqual(eq(Employee.EmployeeStatus.ACTIVE), any(LocalDate.class)))
                .thenReturn(4L);
        when(departmentRepository.count()).thenReturn(8L);

        when(attendanceRepository.countByAttendanceDateBetweenAndStatus(any(), any(), eq(Attendance.Status.PRESENT)))
                .thenReturn(85L);
        when(attendanceRepository.countByAttendanceDateBetweenAndStatus(any(), any(), eq(Attendance.Status.ABSENT)))
                .thenReturn(10L);
        when(attendanceRepository.countByAttendanceDateBetweenAndStatus(any(), any(), eq(Attendance.Status.LATE)))
                .thenReturn(5L);

        when(attendanceRepository.sumWorkedSecondsBetween(any(), any())).thenReturn(2448000.0); // 680 hours in seconds
        when(employeeRepository.countActiveGroupedByDepartment()).thenReturn(Collections.emptyList());
        when(attendanceRepository.countByDateAndStatusBetween(any(), any())).thenReturn(Collections.emptyList());

        DashboardSummaryResponse response = dashboardService.getSummary(2L, true, "today");

        assertThat(response.getTotalEmployees()).isEqualTo(100L);
        assertThat(response.getNewHiresThisMonth()).isEqualTo(4L);
        assertThat(response.getTotalDepartments()).isEqualTo(8L);
        assertThat(response.getPresentToday()).isEqualTo(85L);
        assertThat(response.getAbsentToday()).isEqualTo(10L);
        assertThat(response.getLateToday()).isEqualTo(5L);
        assertThat(response.getHoursLoggedToday()).isEqualTo(680.0);
        assertThat(response.getPendingLeaveCount()).isEqualTo(5L);
        assertThat(response.getAppliedRange()).isEqualTo("today");
    }
}
