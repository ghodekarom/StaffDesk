package com.staffdesk.ems.attendance.dto;

import com.staffdesk.ems.attendance.entity.Attendance;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

/**
 * Used by HR/Admin to manually create or override a specific employee's
 * record for a specific date (employeeId + date come from the URL path).
 */
public record AttendanceUpsertRequest(
        Instant clockIn,
        Instant clockOut,
        @NotNull Attendance.Status status
) {
}
