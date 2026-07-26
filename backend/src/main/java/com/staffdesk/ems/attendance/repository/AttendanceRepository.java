package com.staffdesk.ems.attendance.repository;

import com.staffdesk.ems.attendance.entity.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate attendanceDate);

    Page<Attendance> findByEmployeeIdAndAttendanceDateBetween(
            Long employeeId, LocalDate from, LocalDate to, Pageable pageable);
}
