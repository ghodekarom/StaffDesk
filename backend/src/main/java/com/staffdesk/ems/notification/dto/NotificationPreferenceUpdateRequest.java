package com.staffdesk.ems.notification.dto;

import jakarta.validation.constraints.NotNull;

// All three fields are required on every PUT — this mirrors a settings form
// that always renders all three toggles, so there's no partial-update case
// to support (unlike, say, a PATCH). Keeping it non-partial avoids ambiguity
// about what an omitted field means.
public class NotificationPreferenceUpdateRequest {

    @NotNull
    private Boolean leaveDecisionEnabled;

    @NotNull
    private Boolean newLeaveRequestEnabled;

    @NotNull
    private Boolean attendanceReminderEnabled;

    public Boolean getLeaveDecisionEnabled() {
        return leaveDecisionEnabled;
    }

    public void setLeaveDecisionEnabled(Boolean leaveDecisionEnabled) {
        this.leaveDecisionEnabled = leaveDecisionEnabled;
    }

    public Boolean getNewLeaveRequestEnabled() {
        return newLeaveRequestEnabled;
    }

    public void setNewLeaveRequestEnabled(Boolean newLeaveRequestEnabled) {
        this.newLeaveRequestEnabled = newLeaveRequestEnabled;
    }

    public Boolean getAttendanceReminderEnabled() {
        return attendanceReminderEnabled;
    }

    public void setAttendanceReminderEnabled(Boolean attendanceReminderEnabled) {
        this.attendanceReminderEnabled = attendanceReminderEnabled;
    }
}
