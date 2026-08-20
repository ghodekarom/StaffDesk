package com.staffdesk.ems.attendance.dto;

import com.staffdesk.ems.attendance.entity.Attendance;

import java.time.Instant;
import java.time.LocalDate;

public record AttendanceResponse(
        Long id,
        Long employeeId,
        String employeeCode,
        String employeeName,
        String departmentName,
        LocalDate attendanceDate,
        Instant clockIn,
        Instant clockOut,
        Attendance.Status status,
        Instant createdAt
) {
    public static AttendanceResponse from(Attendance attendance) {
        var employee = attendance.getEmployee();
        var department = employee.getDepartment();
        return new AttendanceResponse(
                attendance.getId(),
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getFirstName() + " " + employee.getLastName(),
                department != null ? department.getName() : null,
                attendance.getAttendanceDate(),
                attendance.getClockIn(),
                attendance.getClockOut(),
                attendance.getStatus(),
                attendance.getCreatedAt()
        );
    }
}