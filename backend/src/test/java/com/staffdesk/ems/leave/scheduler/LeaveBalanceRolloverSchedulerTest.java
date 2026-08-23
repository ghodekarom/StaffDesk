package com.staffdesk.ems.leave.scheduler;

import com.staffdesk.ems.leave.service.LeaveBalanceProvisioningService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LeaveBalanceRolloverSchedulerTest {

    @Mock
    private LeaveBalanceProvisioningService leaveBalanceProvisioningService;

    @Test
    void provisionNextYearBalances_provisionsForCalendarYearAfterToday() {
        LocalDate dec1_2026 = LocalDate.of(2026, 12, 1);
        Clock fixedClock = Clock.fixed(dec1_2026.atStartOfDay(ZoneId.systemDefault()).toInstant(), ZoneId.systemDefault());
        LeaveBalanceRolloverScheduler scheduler =
                new LeaveBalanceRolloverScheduler(leaveBalanceProvisioningService, fixedClock);
        when(leaveBalanceProvisioningService.provisionForAllActiveEmployees(2027)).thenReturn(45);

        scheduler.provisionNextYearBalances();

        verify(leaveBalanceProvisioningService).provisionForAllActiveEmployees(2027);
    }
}