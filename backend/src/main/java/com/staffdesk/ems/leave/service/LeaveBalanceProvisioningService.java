package com.staffdesk.ems.leave.service;

import com.staffdesk.ems.employee.entity.Employee;
import com.staffdesk.ems.employee.repository.EmployeeRepository;
import com.staffdesk.ems.leave.entity.LeaveBalance;
import com.staffdesk.ems.leave.entity.LeaveRequest;
import com.staffdesk.ems.leave.repository.LeaveBalanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Single place that knows what a fresh year of leave balances looks like,
 * used by three call sites that would otherwise each reimplement the same
 * "does this employee/year/type combo already have a row?" check:
 *
 *  - EmployeeServiceImpl.create() -- new hires get balances immediately.
 *  - the one-off backfill migration (V14) -- covers employees created
 *    before this fix existed. (SQL-based backfill runs once via Flyway;
 *    this Java path is for anything created after the backfill runs.)
 *  - LeaveBalanceRolloverScheduler / the manual admin rollover endpoint --
 *    creates next year's balances ahead of the Jan 1 boundary, so this
 *    same class of bug doesn't recur annually.
 *
 * See employee-leave-balance-gap-issue.md (#9, #13, #14).
 */
@Service
public class LeaveBalanceProvisioningService {

    // Matches V2__seed_data.sql's defaults exactly -- if these ever
    // diverge, new-hire balances and seeded balances would silently mean
    // different things for the same leave type.
    private static final Map<LeaveRequest.LeaveType, BigDecimal> DEFAULT_ANNUAL_ALLOWANCE = new EnumMap<>(Map.of(
            LeaveRequest.LeaveType.SICK, BigDecimal.valueOf(12),
            LeaveRequest.LeaveType.CASUAL, BigDecimal.valueOf(12),
            LeaveRequest.LeaveType.EARNED, BigDecimal.valueOf(15)
    ));

    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveBalanceProvisioningService(LeaveBalanceRepository leaveBalanceRepository,
                                           EmployeeRepository employeeRepository) {
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.employeeRepository = employeeRepository;
    }

    /**
     * Creates whichever default-type balance rows this employee is missing
     * for the given year, leaving any existing rows (and their `used`
     * values) untouched. Safe to call repeatedly -- already-present types
     * are skipped rather than duplicated or reset.
     *
     * @return the newly created rows only (empty if nothing was missing).
     */
    @Transactional
    public List<LeaveBalance> ensureBalancesExist(Employee employee, int year) {
        Set<LeaveRequest.LeaveType> existingTypes = leaveBalanceRepository
                .findByEmployeeIdAndYear(employee.getId(), year).stream()
                .map(LeaveBalance::getLeaveType)
                .collect(Collectors.toSet());

        List<LeaveBalance> created = DEFAULT_ANNUAL_ALLOWANCE.entrySet().stream()
                .filter(entry -> !existingTypes.contains(entry.getKey()))
                .map(entry -> {
                    LeaveBalance balance = new LeaveBalance();
                    balance.setEmployee(employee);
                    balance.setLeaveType(entry.getKey());
                    balance.setYear(year);
                    balance.setTotal(entry.getValue());
                    balance.setUsed(BigDecimal.ZERO);
                    return balance;
                })
                .toList();

        return created.isEmpty() ? created : leaveBalanceRepository.saveAll(created);
    }

    /**
     * Bulk version for the annual rollover: provisions the given year's
     * balances for every currently-ACTIVE employee. Shared by
     * LeaveBalanceRolloverScheduler (automatic, ahead of Jan 1) and the
     * manual ADMIN "run rollover now" endpoint (in case the schedule needs
     * to be triggered early, e.g. an org restructure or the job window
     * being missed) -- see #13.
     *
     * Inactive/terminated employees are intentionally skipped: no point
     * pre-allocating leave for someone not expected to be working under
     * that status.
     *
     * @return the number of balance rows actually created (employees who
     *         already had all three types for that year contribute zero).
     */
    @Transactional
    public int provisionForAllActiveEmployees(int year) {
        int created = 0;
        for (Employee employee : employeeRepository.findByStatus(Employee.EmployeeStatus.ACTIVE)) {
            created += ensureBalancesExist(employee, year).size();
        }
        return created;
    }
}