package com.staffdesk.ems.attendance.service;

import com.staffdesk.ems.attendance.dto.AttendanceResponse;
import com.staffdesk.ems.attendance.entity.Attendance;
import com.staffdesk.ems.attendance.exception.AttendanceExceptions;
import com.staffdesk.ems.attendance.repository.AttendanceRepository;
import com.staffdesk.ems.employee.entity.Employee;
import com.staffdesk.ems.employee.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private AttendanceService attendanceService;

    private Employee employee;
    private Employee manager;

    @BeforeEach
    void setUp() {
        manager = new Employee();
        manager.setId(2L);
        manager.setFirstName("Grace");
        manager.setLastName("Hopper");

        employee = new Employee();
        employee.setId(1L);
        employee.setFirstName("Ada");
        employee.setLastName("Lovelace");
        employee.setEmployeeCode("EMP-001");
        employee.setManager(manager);
    }

    @Test
    void clockIn_createsNewAttendanceRecord_whenNotClockedInToday() {
        when(attendanceRepository.findByEmployeeIdAndAttendanceDate(eq(1L), any(LocalDate.class)))
                .thenReturn(Optional.empty());
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(invocation -> {
            Attendance a = invocation.getArgument(0);
            a.setId(10L);
            return a;
        });

        AttendanceResponse response = attendanceService.clockIn(1L);

        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.clockIn()).isNotNull();
        verify(attendanceRepository).save(any(Attendance.class));
    }

    @Test
    void clockIn_throwsAlreadyClockedInException_whenAlreadyClockedIn() {
        Attendance existing = new Attendance();
        existing.setId(10L);
        existing.setEmployee(employee);
        existing.setClockIn(Instant.now());

        when(attendanceRepository.findByEmployeeIdAndAttendanceDate(eq(1L), any(LocalDate.class)))
                .thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> attendanceService.clockIn(1L))
                .isInstanceOf(AttendanceExceptions.AlreadyClockedInException.class);
        verify(attendanceRepository, never()).save(any());
    }

    @Test
    void clockOut_setsClockOut_whenClockedIn() {
        Attendance existing = new Attendance();
        existing.setId(10L);
        existing.setEmployee(employee);
        existing.setClockIn(Instant.now());

        when(attendanceRepository.findByEmployeeIdAndAttendanceDate(eq(1L), any(LocalDate.class)))
                .thenReturn(Optional.of(existing));
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AttendanceResponse response = attendanceService.clockOut(1L);

        assertThat(response.clockOut()).isNotNull();
        verify(attendanceRepository).save(existing);
    }

    @Test
    void clockOut_throwsNotClockedInException_whenNoRecordFound() {
        when(attendanceRepository.findByEmployeeIdAndAttendanceDate(eq(1L), any(LocalDate.class)))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> attendanceService.clockOut(1L))
                .isInstanceOf(AttendanceExceptions.NotClockedInException.class);
    }

    @Test
    void clockOut_throwsAlreadyClockedOutException_whenAlreadyClockedOut() {
        Attendance existing = new Attendance();
        existing.setId(10L);
        existing.setEmployee(employee);
        existing.setClockIn(Instant.now().minusSeconds(3600));
        existing.setClockOut(Instant.now());

        when(attendanceRepository.findByEmployeeIdAndAttendanceDate(eq(1L), any(LocalDate.class)))
                .thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> attendanceService.clockOut(1L))
                .isInstanceOf(AttendanceExceptions.AlreadyClockedOutException.class);
    }

    @Test
    void getHistoryForEmployee_succeeds_whenCallerIsDirectManager() {
        LocalDate from = LocalDate.of(2026, 8, 1);
        LocalDate to = LocalDate.of(2026, 8, 30);
        PageRequest pageable = PageRequest.of(0, 10);

        Attendance a = new Attendance();
        a.setId(10L);
        a.setEmployee(employee);
        a.setAttendanceDate(LocalDate.of(2026, 8, 15));

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(attendanceRepository.findByEmployeeIdAndAttendanceDateBetween(1L, from, to, pageable))
                .thenReturn(new PageImpl<>(List.of(a)));

        Page<AttendanceResponse> page = attendanceService.getHistoryForEmployee(1L, 2L, from, to, pageable);

        assertThat(page.getContent()).hasSize(1);
    }

    @Test
    void getHistoryForEmployee_throwsException_whenCallerIsNotDirectManager() {
        LocalDate from = LocalDate.of(2026, 8, 1);
        LocalDate to = LocalDate.of(2026, 8, 30);
        PageRequest pageable = PageRequest.of(0, 10);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        // Manager ID 99 is not the direct manager (manager ID is 2)
        assertThatThrownBy(() -> attendanceService.getHistoryForEmployee(1L, 99L, from, to, pageable))
                .isInstanceOf(AttendanceExceptions.EmployeeNotFoundException.class);
    }
}
