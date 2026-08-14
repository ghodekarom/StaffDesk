package com.staffdesk.ems.attendance.scheduler;

import com.staffdesk.ems.attendance.repository.AttendanceRepository;
import com.staffdesk.ems.employee.entity.Employee;
import com.staffdesk.ems.employee.repository.EmployeeRepository;
import com.staffdesk.ems.leave.repository.LeaveRequestRepository;
import com.staffdesk.ems.notification.entity.Notification;
import com.staffdesk.ems.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;

/**
 * Nudges employees who haven't clocked in yet today. Runs once on weekday
 * mornings — early enough that "you haven't clocked in" is still useful
 * advice rather than a stale complaint about a day that's basically over.
 *
 * Each recipient's own "Attendance reminders" toggle (Settings >
 * Notifications) is enforced by NotificationService.notify itself, so this
 * class doesn't need to check preferences directly.
 */
@Component
public class AttendanceReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(AttendanceReminderScheduler.class);

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final NotificationService notificationService;
    private final Clock clock;

    @Autowired
    public AttendanceReminderScheduler(EmployeeRepository employeeRepository,
                                       AttendanceRepository attendanceRepository,
                                       LeaveRequestRepository leaveRequestRepository,
                                       NotificationService notificationService) {
        this(employeeRepository, attendanceRepository, leaveRequestRepository, notificationService,
                Clock.systemDefaultZone());
    }

    // Package-private, Clock-injecting constructor used by tests to pin
    // "today" to a specific weekday instead of depending on whatever day
    // the test happens to run on.
    AttendanceReminderScheduler(EmployeeRepository employeeRepository,
                                AttendanceRepository attendanceRepository,
                                LeaveRequestRepository leaveRequestRepository,
                                NotificationService notificationService,
                                Clock clock) {
        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.notificationService = notificationService;
        this.clock = clock;
    }

    // 10:30 AM, Monday–Friday, server-local time. Weekend runs are skipped
    // in the cron expression itself rather than filtered in code, since
    // there's no shift/roster concept yet to say who's actually scheduled
    // to work a given day.
    @Scheduled(cron = "0 30 10 * * MON-FRI")
    public void remindEmployeesWhoHaventClockedIn() {
        LocalDate today = LocalDate.now(clock);
        if (today.getDayOfWeek() == DayOfWeek.SATURDAY || today.getDayOfWeek() == DayOfWeek.SUNDAY) {
            return; // belt-and-braces in case this is ever invoked manually/in tests
        }

        int sent = 0;
        for (Employee employee : employeeRepository.findByStatus(Employee.EmployeeStatus.ACTIVE)) {
            if (attendanceRepository.findByEmployeeIdAndAttendanceDate(employee.getId(), today).isPresent()) {
                continue; // already clocked in (or otherwise marked) for today
            }
            if (leaveRequestRepository.existsApprovedLeaveCoveringDate(employee.getId(), today)) {
                continue; // on approved leave — nothing to remind them about
            }

            notificationService.notify(
                    employee.getId(),
                    Notification.Type.ATTENDANCE_REMINDER,
                    "Attendance reminder",
                    "You haven't clocked in yet today (" + today + "). Don't forget to mark your attendance.",
                    "/attendance"
            );
            sent++;
        }

        log.info("Attendance reminder job sent {} notification(s) for {}", sent, today);
    }
}
