package com.staffdesk.ems.attendance.repository;

import com.staffdesk.ems.attendance.entity.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate attendanceDate);

    Page<Attendance> findByEmployeeIdAndAttendanceDateBetween(
            Long employeeId, LocalDate from, LocalDate to, Pageable pageable);

    // Overrides the inherited findAll(Pageable) to eagerly fetch each row's
    // employee + department in the same query, instead of one lazy-load
    // round trip per row when AttendanceResponse.from() reads
    // employee.getDepartment() — avoids N+1 on the Overview page's
    // "Recent Attendance Logs" list.
    @Override
    @EntityGraph(attributePaths = {"employee", "employee.department"})
    Page<Attendance> findAll(Pageable pageable);

    long countByAttendanceDateAndStatus(LocalDate attendanceDate, Attendance.Status status);

    long countByAttendanceDate(LocalDate attendanceDate);

    // Issue #4: MANAGER-scoped equivalent of findAll(Pageable) above, used
    // by AttendanceService#getRecentAcrossEmployees when the caller is a
    // MANAGER (not ADMIN/HR) -- restricts the "Recent Attendance Logs" feed
    // to that manager's direct reports (Attendance.employee.manager.id)
    // instead of every employee. Same eager-fetch as findAll to avoid N+1
    // when AttendanceResponse.from() reads employee.getDepartment().
    @EntityGraph(attributePaths = {"employee", "employee.department"})
    Page<Attendance> findByEmployeeManagerId(Long managerId, Pageable pageable);

    // Powers the Overview page's "Attendance Trend" chart — one row per
    // calendar day in the range, with a present/absent/late/half-day
    // breakdown, computed server-side instead of guessed on the client.
    @Query("""
            SELECT a.attendanceDate AS attendanceDate,
                   a.status AS status,
                   COUNT(a) AS total
            FROM Attendance a
            WHERE a.attendanceDate BETWEEN :from AND :to
            GROUP BY a.attendanceDate, a.status
            ORDER BY a.attendanceDate ASC
            """)
    List<DailyStatusCount> countByDateAndStatusBetween(
            @Param("from") LocalDate from, @Param("to") LocalDate to);

    // Sum of actual worked hours (clockOut - clockIn) per day, for whichever
    // days have a completed clock-out. Used for the "hours logged" stat
    // instead of the old `rowsFetched * 8` approximation.
    // Native query: Postgres' EXTRACT(EPOCH FROM interval) has no clean JPQL
    // equivalent across dialects, and this module is Postgres-only (see
    // application.yml), so a native query is simpler than a JPQL FUNCTION()
    // hack that would only work on one database anyway.
    @Query(value = """
            SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (clock_out - clock_in))), 0)
            FROM attendance
            WHERE attendance_date = :date AND clock_out IS NOT NULL
            """, nativeQuery = true)
    Double sumWorkedSecondsForDate(@Param("date") LocalDate date);

    interface DailyStatusCount {
        LocalDate getAttendanceDate();
        Attendance.Status getStatus();
        long getTotal();
    }
}