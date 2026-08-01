package com.staffdesk.ems.leave.service;

import com.staffdesk.ems.employee.entity.Employee;
import com.staffdesk.ems.employee.repository.EmployeeRepository;
import com.staffdesk.ems.leave.dto.LeaveBalanceResponse;
import com.staffdesk.ems.leave.dto.LeaveDecisionRequest;
import com.staffdesk.ems.leave.dto.LeaveRequestCreateRequest;
import com.staffdesk.ems.leave.dto.LeaveRequestResponse;
import com.staffdesk.ems.leave.entity.LeaveBalance;
import com.staffdesk.ems.leave.entity.LeaveRequest;
import com.staffdesk.ems.leave.repository.LeaveBalanceRepository;
import com.staffdesk.ems.leave.repository.LeaveRequestRepository;
import com.staffdesk.ems.notification.entity.Notification;
import com.staffdesk.ems.notification.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    public LeaveService(LeaveRequestRepository leaveRequestRepository,
                        LeaveBalanceRepository leaveBalanceRepository,
                        EmployeeRepository employeeRepository,
                        NotificationService notificationService) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.employeeRepository = employeeRepository;
        this.notificationService = notificationService;
    }

    // ---------- Self-service ----------

    @Transactional
    public LeaveRequestResponse create(Long employeeId, LeaveRequestCreateRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new InvalidLeaveDateRangeException();
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundForLeaveException(employeeId));

        List<LeaveRequest> overlapping = leaveRequestRepository.findOverlapping(
                employeeId, request.getStartDate(), request.getEndDate());
        if (!overlapping.isEmpty()) {
            throw new OverlappingLeaveRequestException();
        }

        long requestedDays = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        int year = request.getStartDate().getYear();

        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeAndYear(employeeId, request.getLeaveType(), year)
                .orElse(null);

        if (balance == null || balance.getRemaining() == null
                || balance.getRemaining().compareTo(BigDecimal.valueOf(requestedDays)) < 0) {
            BigDecimal remaining = balance != null && balance.getRemaining() != null
                    ? balance.getRemaining() : BigDecimal.ZERO;
            throw new InsufficientLeaveBalanceException(request.getLeaveType(), remaining, requestedDays);
        }

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setEmployee(employee);
        leaveRequest.setLeaveType(request.getLeaveType());
        leaveRequest.setStartDate(request.getStartDate());
        leaveRequest.setEndDate(request.getEndDate());
        leaveRequest.setReason(request.getReason());
        leaveRequest.setStatus(LeaveRequest.LeaveStatus.PENDING);

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);

        // Notify the requester's manager, if they have one. There's no
        // "assigned approver" concept in the data model today — review is
        // open to any ADMIN/HR/MANAGER — so this is the one unambiguous
        // recipient we can resolve without a broader role lookup. See the
        // note left with this change for how to extend it to all HR/Admin.
        if (employee.getManager() != null) {
            notificationService.notify(
                    employee.getManager().getId(),
                    Notification.Type.LEAVE_REQUEST_SUBMITTED,
                    "New leave request",
                    employee.getFirstName() + " " + employee.getLastName() + " requested " + requestedDays
                            + " day(s) off (" + request.getStartDate() + " to " + request.getEndDate() + ")",
                    "/leave/team"
            );
        }

        return LeaveRequestResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<LeaveRequestResponse> getMyRequests(Long employeeId, LeaveRequest.LeaveStatus status, Pageable pageable) {
        Page<LeaveRequest> page = status != null
                ? leaveRequestRepository.findByEmployeeIdAndStatus(employeeId, status, pageable)
                : leaveRequestRepository.findByEmployeeId(employeeId, pageable);
        return page.map(LeaveRequestResponse::from);
    }

    @Transactional(readOnly = true)
    public List<LeaveBalanceResponse> getMyBalances(Long employeeId, Integer year) {
        int resolvedYear = year != null ? year : LocalDate.now().getYear();
        return leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, resolvedYear).stream()
                .map(LeaveBalanceResponse::from)
                .toList();
    }

    @Transactional
    public LeaveRequestResponse cancel(Long employeeId, Long requestId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new LeaveRequestNotFoundException(requestId));

        if (!leaveRequest.getEmployee().getId().equals(employeeId)) {
            // Deliberately reuses "not found" rather than a 403 — avoids confirming
            // another employee's request ID exists to someone who shouldn't see it.
            throw new LeaveRequestNotFoundException(requestId);
        }
        if (leaveRequest.getStatus() != LeaveRequest.LeaveStatus.PENDING) {
            throw new LeaveAlreadyDecidedException(leaveRequest.getStatus());
        }

        leaveRequest.setStatus(LeaveRequest.LeaveStatus.REJECTED);
        leaveRequest.setReason(appendNote(leaveRequest.getReason(), "Cancelled by employee"));

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return LeaveRequestResponse.from(saved);
    }

    // ---------- HR / Admin / Manager: approval workflow ----------

    @Transactional(readOnly = true)
    public Page<LeaveRequestResponse> getAllRequests(LeaveRequest.LeaveStatus status, Pageable pageable) {
        Page<LeaveRequest> page = status != null
                ? leaveRequestRepository.findByStatus(status, pageable)
                : leaveRequestRepository.findAll(pageable);
        return page.map(LeaveRequestResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<LeaveRequestResponse> getRequestsForEmployee(Long employeeId, LeaveRequest.LeaveStatus status, Pageable pageable) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new EmployeeNotFoundForLeaveException(employeeId);
        }
        return getMyRequests(employeeId, status, pageable);
    }

    @Transactional
    public LeaveRequestResponse approve(Long requestId, Long approverEmployeeId, LeaveDecisionRequest decision) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new LeaveRequestNotFoundException(requestId));

        if (leaveRequest.getStatus() != LeaveRequest.LeaveStatus.PENDING) {
            throw new LeaveAlreadyDecidedException(leaveRequest.getStatus());
        }

        Employee approver = employeeRepository.findById(approverEmployeeId)
                .orElseThrow(() -> new EmployeeNotFoundForLeaveException(approverEmployeeId));

        long days = ChronoUnit.DAYS.between(leaveRequest.getStartDate(), leaveRequest.getEndDate()) + 1;
        int year = leaveRequest.getStartDate().getYear();

        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeAndYear(leaveRequest.getEmployee().getId(), leaveRequest.getLeaveType(), year)
                .orElse(null);

        BigDecimal remaining = balance != null && balance.getRemaining() != null ? balance.getRemaining() : BigDecimal.ZERO;
        if (balance == null || remaining.compareTo(BigDecimal.valueOf(days)) < 0) {
            throw new InsufficientLeaveBalanceException(leaveRequest.getLeaveType(), remaining, days);
        }

        balance.setUsed(balance.getUsed().add(BigDecimal.valueOf(days)));
        leaveBalanceRepository.save(balance);

        leaveRequest.setStatus(LeaveRequest.LeaveStatus.APPROVED);
        leaveRequest.setApprovedBy(approver);
        if (decision != null && decision.getNote() != null && !decision.getNote().isBlank()) {
            leaveRequest.setReason(appendNote(leaveRequest.getReason(), "Approver note: " + decision.getNote()));
        }

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);

        notificationService.notify(
                saved.getEmployee().getId(),
                Notification.Type.LEAVE_REQUEST_APPROVED,
                "Leave request approved",
                "Your request for " + saved.getStartDate() + " to " + saved.getEndDate() + " was approved by "
                        + approver.getFirstName() + " " + approver.getLastName(),
                "/leave"
        );

        return LeaveRequestResponse.from(saved);
    }

    @Transactional
    public LeaveRequestResponse reject(Long requestId, Long approverEmployeeId, LeaveDecisionRequest decision) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new LeaveRequestNotFoundException(requestId));

        if (leaveRequest.getStatus() != LeaveRequest.LeaveStatus.PENDING) {
            throw new LeaveAlreadyDecidedException(leaveRequest.getStatus());
        }

        Employee approver = employeeRepository.findById(approverEmployeeId)
                .orElseThrow(() -> new EmployeeNotFoundForLeaveException(approverEmployeeId));

        leaveRequest.setStatus(LeaveRequest.LeaveStatus.REJECTED);
        leaveRequest.setApprovedBy(approver);
        if (decision != null && decision.getNote() != null && !decision.getNote().isBlank()) {
            leaveRequest.setReason(appendNote(leaveRequest.getReason(), "Rejection note: " + decision.getNote()));
        }

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);

        notificationService.notify(
                saved.getEmployee().getId(),
                Notification.Type.LEAVE_REQUEST_REJECTED,
                "Leave request rejected",
                "Your request for " + saved.getStartDate() + " to " + saved.getEndDate() + " was rejected by "
                        + approver.getFirstName() + " " + approver.getLastName(),
                "/leave"
        );

        return LeaveRequestResponse.from(saved);
    }

    private String appendNote(String existingReason, String note) {
        if (existingReason == null || existingReason.isBlank()) {
            return note;
        }
        return existingReason + " | " + note;
    }
}