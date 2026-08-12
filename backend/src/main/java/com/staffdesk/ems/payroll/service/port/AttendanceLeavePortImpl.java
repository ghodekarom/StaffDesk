package com.staffdesk.ems.payroll.service.port;

import com.staffdesk.ems.attendance.entity.Attendance;
import com.staffdesk.ems.attendance.repository.AttendanceRepository;
import com.staffdesk.ems.leave.entity.LeaveRequest;
import com.staffdesk.ems.leave.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Real implementation of {@link AttendanceLeavePort}, replacing the placeholder that
 * faked zero LOP for everyone.
 *
 * <p>Implements the LOP rule already documented on the interface per the §7.3
 * "simpler option": a day is LOP if there's no {@link Attendance} row for it AND
 * it isn't covered by an approved {@link LeaveRequest}. SICK/CASUAL/EARNED are all
 * treated as paid leave, since {@code leave_balances} has no paid/unpaid
 * distinction today — matches the interface's javadoc, not re-litigated here.
 *
 * <p><b>Two further assumptions, not settled anywhere in the scoping doc, so
 * flagged explicitly rather than silently baked in:</b>
 * <ol>
 *   <li>{@code workingDays} = calendar days in the period excluding Saturday and
 *       Sunday. There's no company holiday-calendar table, so public holidays are
 *       NOT excluded — a real holiday will read as LOP unless the employee happens
 *       to have an attendance or approved-leave row covering it. This is downstream
 *       of the still-open §7 item 2 (pay cycle) and should be revisited together
 *       with that decision, likely via a new {@code holidays} table.</li>
 *   <li>{@link Attendance#getStatus()} is not inspected. Per the interface's literal
 *       wording, ANY attendance row — PRESENT, ABSENT, HALF_DAY, or LATE — counts as
 *       "there's an attendance row," so an explicit ABSENT row currently does NOT
 *       count as LOP. That's very likely wrong for ABSENT (and HALF_DAY needs a
 *       proration rule for {@code paidDays}, e.g. 0.5), but neither is specified by
 *       the §7.3 decision as written. Deliberately not inventing that rule here —
 *       flagging it as a follow-up instead of guessing.</li>
 * </ol>
 */
@Component
@RequiredArgsConstructor
public class AttendanceLeavePortImpl implements AttendanceLeavePort {

    private static final int ATTENDANCE_PAGE_SIZE = 500;

    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    @Override
    public AttendancePeriodSummary summarize(Long employeeId, LocalDate periodStart, LocalDate periodEnd) {
        if (periodStart.isAfter(periodEnd)) {
            throw new IllegalArgumentException("periodStart must not be after periodEnd");
        }

        Set<LocalDate> attendanceDates = fetchAttendanceDates(employeeId, periodStart, periodEnd);
        List<LeaveRequest> approvedLeave = leaveRequestRepository
                .findOverlapping(employeeId, periodStart, periodEnd)
                .stream()
                .filter(lr -> lr.getStatus() == LeaveRequest.LeaveStatus.APPROVED)
                .toList();

        int workingDays = 0;
        BigDecimal paidDays = BigDecimal.ZERO;

        for (LocalDate date = periodStart; !date.isAfter(periodEnd); date = date.plusDays(1)) {
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
                continue;
            }
            workingDays++;

            boolean hasAttendance = attendanceDates.contains(date);
            boolean hasApprovedLeave = isCoveredByApprovedLeave(approvedLeave, date);

            if (hasAttendance || hasApprovedLeave) {
                paidDays = paidDays.add(BigDecimal.ONE);
            }
        }

        return new AttendancePeriodSummary(workingDays, paidDays);
    }

    /**
     * Pages through {@link AttendanceRepository#findByEmployeeIdAndAttendanceDateBetween}
     * to build the set of dates with any attendance row. A payroll period is at most
     * ~31 days, so this is normally a single page — pagination is only here as a safety
     * net against unexpectedly large result sets, not because it's expected to matter.
     */
    private Set<LocalDate> fetchAttendanceDates(Long employeeId, LocalDate from, LocalDate to) {
        Set<LocalDate> dates = new HashSet<>();
        Pageable pageable = PageRequest.of(0, ATTENDANCE_PAGE_SIZE);
        Page<Attendance> page;
        do {
            page = attendanceRepository.findByEmployeeIdAndAttendanceDateBetween(employeeId, from, to, pageable);
            page.getContent().forEach(a -> dates.add(a.getAttendanceDate()));
            pageable = pageable.next();
        } while (page.hasNext());
        return dates;
    }

    private boolean isCoveredByApprovedLeave(List<LeaveRequest> approvedLeave, LocalDate date) {
        for (LeaveRequest leaveRequest : approvedLeave) {
            if (!date.isBefore(leaveRequest.getStartDate()) && !date.isAfter(leaveRequest.getEndDate())) {
                return true;
            }
        }
        return false;
    }
}