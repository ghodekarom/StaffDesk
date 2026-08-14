package com.staffdesk.ems.notification.dto;

import com.staffdesk.ems.notification.entity.NotificationPreference;

public class NotificationPreferenceResponse {

    private final boolean leaveDecisionEnabled;
    private final boolean newLeaveRequestEnabled;
    private final boolean attendanceReminderEnabled;

    private NotificationPreferenceResponse(boolean leaveDecisionEnabled, boolean newLeaveRequestEnabled,
                                            boolean attendanceReminderEnabled) {
        this.leaveDecisionEnabled = leaveDecisionEnabled;
        this.newLeaveRequestEnabled = newLeaveRequestEnabled;
        this.attendanceReminderEnabled = attendanceReminderEnabled;
    }

    public static NotificationPreferenceResponse from(NotificationPreference p) {
        return new NotificationPreferenceResponse(
                p.isLeaveDecisionEnabled(), p.isNewLeaveRequestEnabled(), p.isAttendanceReminderEnabled());
    }

    public boolean isLeaveDecisionEnabled() {
        return leaveDecisionEnabled;
    }

    public boolean isNewLeaveRequestEnabled() {
        return newLeaveRequestEnabled;
    }

    public boolean isAttendanceReminderEnabled() {
        return attendanceReminderEnabled;
    }
}
