package com.staffdesk.ems.notification.service;

import com.staffdesk.ems.notification.dto.NotificationPreferenceResponse;
import com.staffdesk.ems.notification.dto.NotificationPreferenceUpdateRequest;
import com.staffdesk.ems.notification.entity.NotificationPreference;
import com.staffdesk.ems.notification.repository.NotificationPreferenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository preferenceRepository;

    public NotificationPreferenceService(NotificationPreferenceRepository preferenceRepository) {
        this.preferenceRepository = preferenceRepository;
    }

    @Transactional(readOnly = true)
    public NotificationPreferenceResponse getForEmployee(Long employeeId) {
        return NotificationPreferenceResponse.from(getOrDefault(employeeId));
    }

    @Transactional
    public NotificationPreferenceResponse update(Long employeeId, NotificationPreferenceUpdateRequest request) {
        NotificationPreference preference = preferenceRepository.findByEmployeeId(employeeId)
                .orElseGet(() -> newPreferenceFor(employeeId));

        preference.setLeaveDecisionEnabled(request.getLeaveDecisionEnabled());
        preference.setNewLeaveRequestEnabled(request.getNewLeaveRequestEnabled());
        preference.setAttendanceReminderEnabled(request.getAttendanceReminderEnabled());

        return NotificationPreferenceResponse.from(preferenceRepository.save(preference));
    }

    /**
     * Used internally by NotificationService to decide whether a given
     * notification should actually be created. Not backed by a saved row
     * unless the employee has changed a setting — a missing row means
     * "defaults", which are all true, so nothing is silently suppressed
     * for employees who have never opened Settings > Notifications.
     */
    @Transactional(readOnly = true)
    NotificationPreference getOrDefault(Long employeeId) {
        return preferenceRepository.findByEmployeeId(employeeId)
                .orElseGet(() -> {
                    NotificationPreference defaults = new NotificationPreference();
                    defaults.setEmployeeId(employeeId);
                    return defaults;
                });
    }

    private NotificationPreference newPreferenceFor(Long employeeId) {
        NotificationPreference preference = new NotificationPreference();
        preference.setEmployeeId(employeeId);
        return preference;
    }
}
