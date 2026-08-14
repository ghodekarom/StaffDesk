package com.staffdesk.ems.notification.entity;

import jakarta.persistence.*;

import java.time.Instant;

// One row per employee, created lazily the first time it's read or written
// (see NotificationPreferenceService#getOrDefault). An employee with no row
// here has never touched their preferences and gets every notification —
// all three flags default to true — rather than silently missing out until
// they visit Settings.
@Entity
@Table(name = "notification_preferences")
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false, unique = true)
    private Long employeeId;

    @Column(name = "leave_decision_enabled", nullable = false)
    private boolean leaveDecisionEnabled = true;

    @Column(name = "new_leave_request_enabled", nullable = false)
    private boolean newLeaveRequestEnabled = true;

    @Column(name = "attendance_reminder_enabled", nullable = false)
    private boolean attendanceReminderEnabled = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public boolean isLeaveDecisionEnabled() {
        return leaveDecisionEnabled;
    }

    public void setLeaveDecisionEnabled(boolean leaveDecisionEnabled) {
        this.leaveDecisionEnabled = leaveDecisionEnabled;
    }

    public boolean isNewLeaveRequestEnabled() {
        return newLeaveRequestEnabled;
    }

    public void setNewLeaveRequestEnabled(boolean newLeaveRequestEnabled) {
        this.newLeaveRequestEnabled = newLeaveRequestEnabled;
    }

    public boolean isAttendanceReminderEnabled() {
        return attendanceReminderEnabled;
    }

    public void setAttendanceReminderEnabled(boolean attendanceReminderEnabled) {
        this.attendanceReminderEnabled = attendanceReminderEnabled;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
