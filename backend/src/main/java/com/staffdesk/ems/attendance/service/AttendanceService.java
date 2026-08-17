package com.staffdesk.ems.attendance.service;

import com.staffdesk.ems.attendance.dto.AttendanceResponse;
import com.staffdesk.ems.attendance.dto.AttendanceUpsertRequest;
import com.staffdesk.ems.attendance.entity.Attendance;
import com.staffdesk.ems.attendance.exception.AttendanceExceptions;
import com.staffdesk.ems.attendance.repository.AttendanceRepository;
import com.staffdesk.ems.employee.entity.Employee;
import com.staffdesk.ems.employee.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, EmployeeRepository employeeRepository) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional
    public AttendanceResponse clockIn(Long employeeId) {
        LocalDate today = LocalDate.now();

        Attendance record = attendanceRepository.findByEmployeeIdAndAttendanceDate(employeeId, today)
                .orElse(null);

        if (record != null && record.getClockIn() != null) {
            throw new AttendanceExceptions.AlreadyClockedInException();
        }

        if (record == null) {
            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new AttendanceExceptions.EmployeeNotFoundException(employeeId));
            record = new Attendance();
            record.setEmployee(employee);
            record.setAttendanceDate(today);
        }

        record.setClockIn(Instant.now());
        return AttendanceResponse.from(attendanceRepository.save(record));
    }

    @Transactional
    public AttendanceResponse clockOut(Long employeeId) {
        LocalDate today = LocalDate.now();

        Attendance record = attendanceRepository.findByEmployeeIdAndAttendanceDate(employeeId, today)
                .orElseThrow(AttendanceExceptions.NotClockedInException::new);

        if (record.getClockIn() == null) {
            throw new AttendanceExceptions.NotClockedInException();
        }
        if (record.getClockOut() != null) {
            throw new AttendanceExceptions.AlreadyClockedOutException();
        }

        record.setClockOut(Instant.now());
        return AttendanceResponse.from(attendanceRepository.save(record));
    }

    @Transactional(readOnly = true)
    public Page<AttendanceResponse> getHistory(Long employeeId, LocalDate from, LocalDate to, Pageable pageable) {
        validateRange(from, to);
        return attendanceRepository
                .findByEmployeeIdAndAttendanceDateBetween(employeeId, from, to, pageable)
                .map(AttendanceResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<AttendanceResponse> getHistoryForEmployee(Long employeeId, LocalDate from, LocalDate to, Pageable pageable) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new AttendanceExceptions.EmployeeNotFoundException(employeeId);
        }
        return getHistory(employeeId, from, to, pageable);
    }

    // Powers the Overview dashboard's "Recent Attendance Logs" widget, which
    // needs the latest clock-ins across every employee — not one person's
    // history. findAll(pageable) already honors whatever sort the caller
    // passes (e.g. "clockIn,desc"), so no custom query is needed here.
    @Transactional(readOnly = true)
    public Page<AttendanceResponse> getRecentAcrossEmployees(Pageable pageable) {
        return attendanceRepository.findAll(pageable).map(AttendanceResponse::from);
    }

    @Transactional(readOnly = true)
    public AttendanceResponse getRecord(Long employeeId, LocalDate date) {
        Attendance record = attendanceRepository.findByEmployeeIdAndAttendanceDate(employeeId, date)
                .orElseThrow(() -> new AttendanceExceptions.RecordNotFoundException(employeeId, date));
        return AttendanceResponse.from(record);
    }

    @Transactional
    public AttendanceResponse upsert(Long employeeId, LocalDate date, AttendanceUpsertRequest request) {
        Attendance record = attendanceRepository.findByEmployeeIdAndAttendanceDate(employeeId, date)
                .orElseGet(() -> {
                    Employee employee = employeeRepository.findById(employeeId)
                            .orElseThrow(() -> new AttendanceExceptions.EmployeeNotFoundException(employeeId));
                    Attendance created = new Attendance();
                    created.setEmployee(employee);
                    created.setAttendanceDate(date);
                    return created;
                });

        record.setClockIn(request.clockIn());
        record.setClockOut(request.clockOut());
        record.setStatus(request.status());

        return AttendanceResponse.from(attendanceRepository.save(record));
    }

    private void validateRange(LocalDate from, LocalDate to) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new AttendanceExceptions.InvalidDateRangeException();
        }
    }
}