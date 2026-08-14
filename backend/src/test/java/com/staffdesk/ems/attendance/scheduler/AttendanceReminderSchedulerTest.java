package com.staffdesk.ems.attendance.scheduler;

import com.staffdesk.ems.attendance.entity.Attendance;
import com.staffdesk.ems.attendance.repository.AttendanceRepository;
import com.staffdesk.ems.employee.entity.Employee;
import com.staffdesk.ems.employee.repository.EmployeeRepository;
import com.staffdesk.ems.leave.repository.LeaveRequestRepository;
import com.staffdesk.ems.notification.entity.Notification;
import com.staffdesk.ems.notification.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceReminderSchedulerTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private LeaveRequestRepository leaveRequestRepository;

    @Mock
    private NotificationService notificationService;

    private AttendanceReminderScheduler scheduler;

    private Employee employeeWithId(long id) {
        Employee employee = new Employee();
        employee.setId(id);
        employee.setStatus(Employee.EmployeeStatus.ACTIVE);
        return employee;
    }

    // Wednesday, so the scheduler's own weekend guard never interferes.
    private static final LocalDate A_WEEKDAY = LocalDate.of(2026, 8, 12);
    private static final Clock FIXED_WEEKDAY_CLOCK =
            Clock.fixed(A_WEEKDAY.atStartOfDay(ZoneId.systemDefault()).toInstant(), ZoneId.systemDefault());

    private void setUpScheduler() {
        scheduler = new AttendanceReminderScheduler(
                employeeRepository, attendanceRepository, leaveRequestRepository, notificationService,
                FIXED_WEEKDAY_CLOCK);
    }

    @Test
    void remindEmployeesWhoHaventClockedIn_sendsReminder_whenNoAttendanceAndNoLeave() {
        Employee employee = employeeWithId(1L);
        when(employeeRepository.findByStatus(Employee.EmployeeStatus.ACTIVE)).thenReturn(List.of(employee));
        when(attendanceRepository.findByEmployeeIdAndAttendanceDate(eq(1L), any(LocalDate.class)))
                .thenReturn(Optional.empty());
        when(leaveRequestRepository.existsApprovedLeaveCoveringDate(eq(1L), any(LocalDate.class)))
                .thenReturn(false);

        setUpScheduler();
        runOnAWeekday();

        verify(notificationService).notify(
                eq(1L), eq(Notification.Type.ATTENDANCE_REMINDER), anyString(), anyString(), eq("/attendance"));
    }

    @Test
    void remindEmployeesWhoHaventClockedIn_skipsEmployee_whenAlreadyClockedIn() {
        Employee employee = employeeWithId(2L);
        when(employeeRepository.findByStatus(Employee.EmployeeStatus.ACTIVE)).thenReturn(List.of(employee));
        when(attendanceRepository.findByEmployeeIdAndAttendanceDate(eq(2L), any(LocalDate.class)))
                .thenReturn(Optional.of(new Attendance()));

        setUpScheduler();
        runOnAWeekday();

        verify(notificationService, never()).notify(any(), any(), any(), any(), any());
        verify(leaveRequestRepository, never()).existsApprovedLeaveCoveringDate(any(), any());
    }

    @Test
    void remindEmployeesWhoHaventClockedIn_skipsEmployee_whenOnApprovedLeaveToday() {
        Employee employee = employeeWithId(3L);
        when(employeeRepository.findByStatus(Employee.EmployeeStatus.ACTIVE)).thenReturn(List.of(employee));
        when(attendanceRepository.findByEmployeeIdAndAttendanceDate(eq(3L), any(LocalDate.class)))
                .thenReturn(Optional.empty());
        when(leaveRequestRepository.existsApprovedLeaveCoveringDate(eq(3L), any(LocalDate.class)))
                .thenReturn(true);

        setUpScheduler();
        runOnAWeekday();

        verify(notificationService, never()).notify(any(), any(), any(), any(), any());
    }

    @Test
    void remindEmployeesWhoHaventClockedIn_doesNothing_onWeekend() {
        LocalDate aSaturday = LocalDate.of(2026, 8, 15);
        Clock weekendClock = Clock.fixed(
                aSaturday.atStartOfDay(ZoneId.systemDefault()).toInstant(), ZoneId.systemDefault());
        scheduler = new AttendanceReminderScheduler(
                employeeRepository, attendanceRepository, leaveRequestRepository, notificationService, weekendClock);

        scheduler.remindEmployeesWhoHaventClockedIn();

        verifyNoInteractions(employeeRepository, notificationService);
    }

    // The job's cron expression already restricts real invocations to
    // Mon–Fri; this test guards the in-code check that also short-circuits
    // if the method is ever triggered manually (e.g. an ops rerun) on a
    // weekend.
    private void runOnAWeekday() {
        scheduler.remindEmployeesWhoHaventClockedIn();
    }
}
