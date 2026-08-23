package com.staffdesk.ems.leave.service;

import com.staffdesk.ems.employee.entity.Employee;
import com.staffdesk.ems.employee.repository.EmployeeRepository;
import com.staffdesk.ems.leave.entity.LeaveBalance;
import com.staffdesk.ems.leave.entity.LeaveRequest;
import com.staffdesk.ems.leave.repository.LeaveBalanceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaveBalanceProvisioningServiceTest {

    @Mock
    private LeaveBalanceRepository leaveBalanceRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    private LeaveBalanceProvisioningService service;

    private Employee employee;

    @BeforeEach
    void setUp() {
        service = new LeaveBalanceProvisioningService(leaveBalanceRepository, employeeRepository);
        employee = new Employee();
        employee.setId(42L);
    }

    @Test
    void ensureBalancesExist_createsAllThreeDefaultTypes_whenNoneExist() {
        when(leaveBalanceRepository.findByEmployeeIdAndYear(42L, 2026)).thenReturn(List.of());
        when(leaveBalanceRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<LeaveBalance> created = service.ensureBalancesExist(employee, 2026);

        assertThat(created).extracting(LeaveBalance::getLeaveType, LeaveBalance::getTotal, LeaveBalance::getUsed)
                .containsExactlyInAnyOrder(
                        tuple(LeaveRequest.LeaveType.SICK, BigDecimal.valueOf(12), BigDecimal.ZERO),
                        tuple(LeaveRequest.LeaveType.CASUAL, BigDecimal.valueOf(12), BigDecimal.ZERO),
                        tuple(LeaveRequest.LeaveType.EARNED, BigDecimal.valueOf(15), BigDecimal.ZERO)
                );
        assertThat(created).allSatisfy(b -> assertThat(b.getYear()).isEqualTo(2026));
        assertThat(created).allSatisfy(b -> assertThat(b.getEmployee()).isSameAs(employee));
    }

    @Test
    void ensureBalancesExist_onlyFillsMissingTypes_whenSomeAlreadyExist() {
        LeaveBalance existingSick = new LeaveBalance();
        existingSick.setLeaveType(LeaveRequest.LeaveType.SICK);
        when(leaveBalanceRepository.findByEmployeeIdAndYear(42L, 2026)).thenReturn(List.of(existingSick));
        when(leaveBalanceRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<LeaveBalance> created = service.ensureBalancesExist(employee, 2026);

        assertThat(created).extracting(LeaveBalance::getLeaveType)
                .containsExactlyInAnyOrder(LeaveRequest.LeaveType.CASUAL, LeaveRequest.LeaveType.EARNED);
    }

    @Test
    void ensureBalancesExist_doesNothing_whenAllTypesAlreadyExist() {
        List<LeaveBalance> existing = List.of(
                balanceOf(LeaveRequest.LeaveType.SICK),
                balanceOf(LeaveRequest.LeaveType.CASUAL),
                balanceOf(LeaveRequest.LeaveType.EARNED)
        );
        when(leaveBalanceRepository.findByEmployeeIdAndYear(42L, 2026)).thenReturn(existing);

        List<LeaveBalance> created = service.ensureBalancesExist(employee, 2026);

        assertThat(created).isEmpty();
        verify(leaveBalanceRepository, never()).saveAll(anyList());
        verify(leaveBalanceRepository, never()).save(any());
    }

    @Test
    void ensureBalancesExist_neverTouchesUsedOnExistingRows() {
        // Idempotency guard: a second call (e.g. the rollover job running
        // twice, or create() somehow being retried) must not reset any
        // balance an employee has already partially used.
        LeaveBalance existingSick = balanceOf(LeaveRequest.LeaveType.SICK);
        existingSick.setUsed(BigDecimal.valueOf(3));
        when(leaveBalanceRepository.findByEmployeeIdAndYear(42L, 2026)).thenReturn(List.of(existingSick));
        when(leaveBalanceRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        service.ensureBalancesExist(employee, 2026);

        assertThat(existingSick.getUsed()).isEqualByComparingTo(BigDecimal.valueOf(3));
        ArgumentCaptor<List<LeaveBalance>> captor = ArgumentCaptor.forClass(List.class);
        verify(leaveBalanceRepository).saveAll(captor.capture());
        assertThat(captor.getValue()).noneMatch(b -> b.getLeaveType() == LeaveRequest.LeaveType.SICK);
    }

    private LeaveBalance balanceOf(LeaveRequest.LeaveType type) {
        LeaveBalance balance = new LeaveBalance();
        balance.setLeaveType(type);
        balance.setUsed(BigDecimal.ZERO);
        return balance;
    }

    @Test
    void provisionForAllActiveEmployees_onlyQueriesActiveEmployees_andSumsCreatedCount() {
        Employee alice = new Employee();
        alice.setId(1L);
        Employee bob = new Employee();
        bob.setId(2L);
        when(employeeRepository.findByStatus(Employee.EmployeeStatus.ACTIVE)).thenReturn(List.of(alice, bob));
        // Alice already has all three types for 2027; Bob has none.
        when(leaveBalanceRepository.findByEmployeeIdAndYear(1L, 2027)).thenReturn(List.of(
                balanceOf(LeaveRequest.LeaveType.SICK),
                balanceOf(LeaveRequest.LeaveType.CASUAL),
                balanceOf(LeaveRequest.LeaveType.EARNED)
        ));
        when(leaveBalanceRepository.findByEmployeeIdAndYear(2L, 2027)).thenReturn(List.of());
        when(leaveBalanceRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        int created = service.provisionForAllActiveEmployees(2027);

        assertThat(created).isEqualTo(3); // only Bob's three missing rows
        verify(employeeRepository).findByStatus(Employee.EmployeeStatus.ACTIVE);
        verify(employeeRepository, never()).findByStatus(Employee.EmployeeStatus.INACTIVE);
        verify(employeeRepository, never()).findByStatus(Employee.EmployeeStatus.TERMINATED);
    }
}