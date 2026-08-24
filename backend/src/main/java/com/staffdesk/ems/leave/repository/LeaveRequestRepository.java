package com.staffdesk.ems.leave.repository;

import com.staffdesk.ems.leave.entity.LeaveRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    Page<LeaveRequest> findByEmployeeId(Long employeeId, Pageable pageable);

    Page<LeaveRequest> findByStatus(LeaveRequest.LeaveStatus status, Pageable pageable);

    Page<LeaveRequest> findByEmployeeIdAndStatus(Long employeeId, LeaveRequest.LeaveStatus status, Pageable pageable);

    // Issue #4: MANAGER-scoped equivalents of findByStatus/findAll, used by
    // LeaveService#getAllRequests when the caller is a MANAGER (not ADMIN/HR)
    // -- restricts the review list to that manager's direct reports
    // (LeaveRequest.employee.manager.id) instead of every employee's requests.
    Page<LeaveRequest> findByEmployeeManagerId(Long managerId, Pageable pageable);

    Page<LeaveRequest> findByEmployeeManagerIdAndStatus(Long managerId, LeaveRequest.LeaveStatus status, Pageable pageable);

    // Overlap check: any existing request for this employee whose [start, end] range
    // intersects the requested range. Used to reject double-booked leave on create.
    @Query("""
            SELECT lr FROM LeaveRequest lr
            WHERE lr.employee.id = :employeeId
              AND lr.status <> com.staffdesk.ems.leave.entity.LeaveRequest.LeaveStatus.REJECTED
              AND lr.startDate <= :endDate
              AND lr.endDate >= :startDate
            """)
    List<LeaveRequest> findOverlapping(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Used by AttendanceReminderScheduler to skip employees who are on
    // approved leave today — only APPROVED matters here, unlike
    // findOverlapping's "anything not rejected" check for booking conflicts.
    @Query("""
            SELECT COUNT(lr) > 0 FROM LeaveRequest lr
            WHERE lr.employee.id = :employeeId
              AND lr.status = com.staffdesk.ems.leave.entity.LeaveRequest.LeaveStatus.APPROVED
              AND lr.startDate <= :date
              AND lr.endDate >= :date
            """)
    boolean existsApprovedLeaveCoveringDate(
            @Param("employeeId") Long employeeId,
            @Param("date") LocalDate date);
}