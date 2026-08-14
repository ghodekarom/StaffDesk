package com.staffdesk.ems.notification.service;

import com.staffdesk.ems.notification.entity.Notification;
import com.staffdesk.ems.notification.entity.NotificationPreference;
import com.staffdesk.ems.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationPreferenceService preferenceService;

    private NotificationService notificationService;

    private static final Long EMPLOYEE_ID = 42L;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(notificationRepository, preferenceService);
    }

    private NotificationPreference preferenceWith(boolean leaveDecision, boolean newLeaveRequest, boolean attendanceReminder) {
        NotificationPreference preference = new NotificationPreference();
        preference.setEmployeeId(EMPLOYEE_ID);
        preference.setLeaveDecisionEnabled(leaveDecision);
        preference.setNewLeaveRequestEnabled(newLeaveRequest);
        preference.setAttendanceReminderEnabled(attendanceReminder);
        return preference;
    }

    @Test
    void notify_savesNotification_whenCategoryEnabled() {
        when(preferenceService.getOrDefault(EMPLOYEE_ID)).thenReturn(preferenceWith(true, true, true));

        notificationService.notify(EMPLOYEE_ID, Notification.Type.LEAVE_REQUEST_APPROVED,
                "Title", "Message", "/leave");

        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void notify_skipsSave_whenLeaveDecisionCategoryDisabled() {
        when(preferenceService.getOrDefault(EMPLOYEE_ID)).thenReturn(preferenceWith(false, true, true));

        notificationService.notify(EMPLOYEE_ID, Notification.Type.LEAVE_REQUEST_REJECTED,
                "Title", "Message", "/leave");

        verify(notificationRepository, never()).save(any());
    }

    @Test
    void notify_skipsSave_whenNewLeaveRequestCategoryDisabled() {
        when(preferenceService.getOrDefault(EMPLOYEE_ID)).thenReturn(preferenceWith(true, false, true));

        notificationService.notify(EMPLOYEE_ID, Notification.Type.LEAVE_REQUEST_SUBMITTED,
                "Title", "Message", "/leave/team");

        verify(notificationRepository, never()).save(any());
    }

    @Test
    void notify_skipsSave_whenAttendanceReminderCategoryDisabled() {
        when(preferenceService.getOrDefault(EMPLOYEE_ID)).thenReturn(preferenceWith(true, true, false));

        notificationService.notify(EMPLOYEE_ID, Notification.Type.ATTENDANCE_REMINDER,
                "Title", "Message", "/attendance");

        verify(notificationRepository, never()).save(any());
    }

    @Test
    void notify_alwaysSaves_generalType_regardlessOfPreferences() {
        when(preferenceService.getOrDefault(EMPLOYEE_ID)).thenReturn(preferenceWith(false, false, false));

        notificationService.notify(EMPLOYEE_ID, Notification.Type.GENERAL,
                "Title", "Message", null);

        verify(notificationRepository).save(any(Notification.class));
    }
}
