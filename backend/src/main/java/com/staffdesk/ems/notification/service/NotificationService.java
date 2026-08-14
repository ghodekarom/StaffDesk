package com.staffdesk.ems.notification.service;

import com.staffdesk.ems.common.exception.ResourceNotFoundException;
import com.staffdesk.ems.notification.dto.NotificationResponse;
import com.staffdesk.ems.notification.entity.Notification;
import com.staffdesk.ems.notification.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceService preferenceService;

    public NotificationService(NotificationRepository notificationRepository,
                               NotificationPreferenceService preferenceService) {
        this.notificationRepository = notificationRepository;
        this.preferenceService = preferenceService;
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> listForEmployee(Long employeeId, Pageable pageable) {
        return notificationRepository.findByRecipientEmployeeId(employeeId, pageable)
                .map(NotificationResponse::from);
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long employeeId) {
        return notificationRepository.countByRecipientEmployeeIdAndReadFalse(employeeId);
    }

    @Transactional
    public void markRead(Long employeeId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));

        if (!notification.getRecipientEmployeeId().equals(employeeId)) {
            // Same "reuse not-found instead of 403" convention as LeaveService#cancel —
            // avoids confirming to the caller that another employee's notification id exists.
            throw new ResourceNotFoundException("Notification not found: " + notificationId);
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllRead(Long employeeId) {
        notificationRepository.markAllReadForEmployee(employeeId);
    }

    /**
     * Called from other services (LeaveService, AttendanceReminderScheduler,
     * and future modules) when a domain event happens that the recipient
     * should be told about. Not exposed via any controller — internal only.
     *
     * Silently no-ops if the recipient has turned this category off in
     * Settings > Notifications, rather than each caller having to check
     * first — GENERAL has no toggle in the UI and always fires.
     */
    @Transactional
    public void notify(Long recipientEmployeeId, Notification.Type type,
                       String title, String message, String link) {
        if (!isEnabled(recipientEmployeeId, type)) {
            return;
        }

        Notification notification = new Notification();
        notification.setRecipientEmployeeId(recipientEmployeeId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setLink(link);
        notificationRepository.save(notification);
    }

    private boolean isEnabled(Long employeeId, Notification.Type type) {
        var preference = preferenceService.getOrDefault(employeeId);
        return switch (type) {
            case LEAVE_REQUEST_SUBMITTED -> preference.isNewLeaveRequestEnabled();
            case LEAVE_REQUEST_APPROVED, LEAVE_REQUEST_REJECTED -> preference.isLeaveDecisionEnabled();
            case ATTENDANCE_REMINDER -> preference.isAttendanceReminderEnabled();
            case GENERAL -> true;
        };
    }
}