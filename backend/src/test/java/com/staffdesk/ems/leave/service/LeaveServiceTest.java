package com.staffdesk.ems.leave.service;

import com.staffdesk.ems.employee.entity.Employee;
import com.staffdesk.ems.employee.repository.EmployeeRepository;
import com.staffdesk.ems.leave.dto.LeaveDecisionRequest;
import com.staffdesk.ems.leave.dto.LeaveRequestCreateRequest;
import com.staffdesk.ems.leave.dto.LeaveRequestResponse;
import com.staffdesk.ems.leave.entity.LeaveBalance;
import com.staffdesk.ems.leave.entity.LeaveRequest;
import com.staffdesk.ems.leave.repository.LeaveBalanceRepository;
import com.staffdesk.ems.leave.repository.LeaveRequestRepository;
import com.staffdesk.ems.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaveServiceTest {

    @Mock
    private LeaveRequestRepository leaveRequestRepository;

    @Mock
    private LeaveBalanceRepository leaveBalanceRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private LeaveService leaveService;

    private Employee employee;
    private Employee manager;
    private LeaveBalance balance;

    @BeforeEach
    void setUp() throws Exception {
        manager = new Employee();
        manager.setId(2L);
        manager.setFirstName("Grace");
        manager.setLastName("Hopper");

        employee = new Employee();
        employee.setId(1L);
        employee.setFirstName("Ada");
        employee.setLastName("Lovelace");
        employee.setManager(manager);

        balance = new LeaveBalance();
        setField(balance, "id", 10L);
        balance.setEmployee(employee);
        balance.setLeaveType(LeaveRequest.LeaveType.CASUAL);
        balance.setYear(2026);
        balance.setTotal(new BigDecimal("10.0"));
        balance.setUsed(new BigDecimal("2.0"));
    }

    @Test
    void create_createsPendingLeaveRequest_whenBalanceIsSufficient() {
        LeaveRequestCreateRequest request = new LeaveRequestCreateRequest();
        request.setLeaveType(LeaveRequest.LeaveType.CASUAL);
        request.setStartDate(LocalDate.of(2026, 8, 10));
        request.setEndDate(LocalDate.of(2026, 8, 11)); // 2 days
        request.setReason("Personal");

        // mock remaining balance = 8
        LeaveBalance b = spy(balance);
        doReturn(new BigDecimal("8.0")).when(b).getRemaining();

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(leaveRequestRepository.findOverlapping(eq(1L), any(), any())).thenReturn(Collections.emptyList());
        when(leaveBalanceRepository.findByEmployeeIdAndLeaveTypeAndYear(1L, LeaveRequest.LeaveType.CASUAL, 2026))
                .thenReturn(Optional.of(b));
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenAnswer(invocation -> {
            LeaveRequest lr = invocation.getArgument(0);
            setField(lr, "id", 100L);
            return lr;
        });

        LeaveRequestResponse response = leaveService.create(1L, request);

        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getStatus()).isEqualTo(LeaveRequest.LeaveStatus.PENDING);
        verify(leaveRequestRepository).save(any(LeaveRequest.class));
        verify(notificationService).notify(eq(2L), any(), any(), any(), any());
    }

    @Test
    void create_throwsInvalidLeaveDateRangeException_whenEndDateBeforeStartDate() {
        LeaveRequestCreateRequest request = new LeaveRequestCreateRequest();
        request.setLeaveType(LeaveRequest.LeaveType.CASUAL);
        request.setStartDate(LocalDate.of(2026, 8, 15));
        request.setEndDate(LocalDate.of(2026, 8, 10));

        assertThatThrownBy(() -> leaveService.create(1L, request))
                .isInstanceOf(InvalidLeaveDateRangeException.class);
    }

    @Test
    void create_throwsOverlappingLeaveRequestException_whenOverlapExists() throws Exception {
        LeaveRequestCreateRequest request = new LeaveRequestCreateRequest();
        request.setLeaveType(LeaveRequest.LeaveType.CASUAL);
        request.setStartDate(LocalDate.of(2026, 8, 10));
        request.setEndDate(LocalDate.of(2026, 8, 12));

        LeaveRequest existing = new LeaveRequest();
        setField(existing, "id", 99L);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(leaveRequestRepository.findOverlapping(eq(1L), any(), any()))
                .thenReturn(List.of(existing));

        assertThatThrownBy(() -> leaveService.create(1L, request))
                .isInstanceOf(OverlappingLeaveRequestException.class);
    }

    @Test
    void create_throwsInsufficientLeaveBalanceException_whenRequestedExceedsRemaining() {
        LeaveRequestCreateRequest request = new LeaveRequestCreateRequest();
        request.setLeaveType(LeaveRequest.LeaveType.CASUAL);
        request.setStartDate(LocalDate.of(2026, 8, 10));
        request.setEndDate(LocalDate.of(2026, 8, 15)); // 6 days

        LeaveBalance b = spy(balance);
        doReturn(new BigDecimal("2.0")).when(b).getRemaining(); // only 2 days remaining

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(leaveRequestRepository.findOverlapping(eq(1L), any(), any())).thenReturn(Collections.emptyList());
        when(leaveBalanceRepository.findByEmployeeIdAndLeaveTypeAndYear(1L, LeaveRequest.LeaveType.CASUAL, 2026))
                .thenReturn(Optional.of(b));

        assertThatThrownBy(() -> leaveService.create(1L, request))
                .isInstanceOf(InsufficientLeaveBalanceException.class);
    }

    @Test
    void approve_approvesPendingRequest_andDeductsBalance() throws Exception {
        LeaveRequest leaveRequest = new LeaveRequest();
        setField(leaveRequest, "id", 100L);
        leaveRequest.setEmployee(employee);
        leaveRequest.setLeaveType(LeaveRequest.LeaveType.CASUAL);
        leaveRequest.setStartDate(LocalDate.of(2026, 8, 10));
        leaveRequest.setEndDate(LocalDate.of(2026, 8, 11)); // 2 days
        leaveRequest.setStatus(LeaveRequest.LeaveStatus.PENDING);

        LeaveBalance b = spy(balance);
        doReturn(new BigDecimal("8.0")).when(b).getRemaining();

        when(leaveRequestRepository.findById(100L)).thenReturn(Optional.of(leaveRequest));
        when(leaveBalanceRepository.findByEmployeeIdAndLeaveTypeAndYear(1L, LeaveRequest.LeaveType.CASUAL, 2026))
                .thenReturn(Optional.of(b));
        when(employeeRepository.findById(2L)).thenReturn(Optional.of(manager));
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LeaveDecisionRequest decision = new LeaveDecisionRequest();
        decision.setNote("Approved, enjoy your time off!");

        LeaveRequestResponse response = leaveService.approve(100L, 2L, null, decision);

        assertThat(response.getStatus()).isEqualTo(LeaveRequest.LeaveStatus.APPROVED);
        verify(leaveBalanceRepository).save(b);
        verify(notificationService).notify(eq(1L), any(), any(), any(), any());
    }

    @Test
    void approve_throwsException_whenManagerScopeDoesNotMatch() throws Exception {
        LeaveRequest leaveRequest = new LeaveRequest();
        setField(leaveRequest, "id", 100L);
        leaveRequest.setEmployee(employee); // employee has manager ID 2
        leaveRequest.setStatus(LeaveRequest.LeaveStatus.PENDING);

        when(leaveRequestRepository.findById(100L)).thenReturn(Optional.of(leaveRequest));

        // Approver manager scope is 99 (not employee's manager)
        assertThatThrownBy(() -> leaveService.approve(100L, 99L, 99L, null))
                .isInstanceOf(LeaveRequestNotFoundException.class);
    }

    private void setField(Object target, String fieldName, Object value) {
        try {
            java.lang.reflect.Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
