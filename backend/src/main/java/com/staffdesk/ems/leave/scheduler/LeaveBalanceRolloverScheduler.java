package com.staffdesk.ems.leave.scheduler;

import com.staffdesk.ems.leave.service.LeaveBalanceProvisioningService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDate;

/**
 * Provisions next year's leave_balances rows for every ACTIVE employee,
 * ahead of the Jan 1 boundary -- without this, the same "no balance row
 * exists" failure that affected new hires (#9) would recur for every
 * employee every January, since `year` is part of the balance lookup key.
 *
 * Runs once a year, a full month early (Dec 1) rather than on Dec 31, so
 * HR/Admin have time to notice and manually run the rollover (see
 * LeaveController's ADMIN-only manual trigger) if this job's output looks
 * wrong before the new year actually starts.
 */
@Component
public class LeaveBalanceRolloverScheduler {

    private static final Logger log = LoggerFactory.getLogger(LeaveBalanceRolloverScheduler.class);

    private final LeaveBalanceProvisioningService leaveBalanceProvisioningService;
    private final Clock clock;

    @Autowired
    public LeaveBalanceRolloverScheduler(LeaveBalanceProvisioningService leaveBalanceProvisioningService) {
        this(leaveBalanceProvisioningService, Clock.systemDefaultZone());
    }

    // Package-private, Clock-injecting constructor used by tests to pin
    // "today" instead of depending on whatever date the test happens to
    // run on.
    LeaveBalanceRolloverScheduler(LeaveBalanceProvisioningService leaveBalanceProvisioningService, Clock clock) {
        this.leaveBalanceProvisioningService = leaveBalanceProvisioningService;
        this.clock = clock;
    }

    // 2:00 AM on December 1st, server-local time.
    @Scheduled(cron = "0 0 2 1 12 *")
    public void provisionNextYearBalances() {
        int nextYear = LocalDate.now(clock).getYear() + 1;
        int created = leaveBalanceProvisioningService.provisionForAllActiveEmployees(nextYear);
        log.info("Leave balance rollover created {} balance row(s) for {}", created, nextYear);
    }
}