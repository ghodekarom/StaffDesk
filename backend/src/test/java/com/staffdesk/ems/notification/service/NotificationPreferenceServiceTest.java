package com.staffdesk.ems.notification.service;

import com.staffdesk.ems.notification.dto.NotificationPreferenceResponse;
import com.staffdesk.ems.notification.dto.NotificationPreferenceUpdateRequest;
import com.staffdesk.ems.notification.entity.NotificationPreference;
import com.staffdesk.ems.notification.repository.NotificationPreferenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationPreferenceServiceTest {

    @Mock
    private NotificationPreferenceRepository preferenceRepository;

    private NotificationPreferenceService preferenceService;

    private static final Long EMPLOYEE_ID = 7L;

    @BeforeEach
    void setUp() {
        preferenceService = new NotificationPreferenceService(preferenceRepository);
    }

    @Test
    void getOrDefault_returnsAllTrueDefaults_whenNoRowExists() {
        when(preferenceRepository.findByEmployeeId(EMPLOYEE_ID)).thenReturn(Optional.empty());

        NotificationPreference result = preferenceService.getOrDefault(EMPLOYEE_ID);

        assertThat(result.isLeaveDecisionEnabled()).isTrue();
        assertThat(result.isNewLeaveRequestEnabled()).isTrue();
        assertThat(result.isAttendanceReminderEnabled()).isTrue();
        // Defaults are never persisted just from a read.
        verify(preferenceRepository, never()).save(any());
    }

    @Test
    void getOrDefault_returnsSavedRow_whenOneExists() {
        NotificationPreference existing = new NotificationPreference();
        existing.setEmployeeId(EMPLOYEE_ID);
        existing.setAttendanceReminderEnabled(false);
        when(preferenceRepository.findByEmployeeId(EMPLOYEE_ID)).thenReturn(Optional.of(existing));

        NotificationPreference result = preferenceService.getOrDefault(EMPLOYEE_ID);

        assertThat(result.isAttendanceReminderEnabled()).isFalse();
    }

    @Test
    void update_createsNewRow_whenNoneExistsYet() {
        when(preferenceRepository.findByEmployeeId(EMPLOYEE_ID)).thenReturn(Optional.empty());
        when(preferenceRepository.save(any(NotificationPreference.class))).thenAnswer(inv -> inv.getArgument(0));

        NotificationPreferenceUpdateRequest request = new NotificationPreferenceUpdateRequest();
        request.setLeaveDecisionEnabled(false);
        request.setNewLeaveRequestEnabled(true);
        request.setAttendanceReminderEnabled(false);

        NotificationPreferenceResponse response = preferenceService.update(EMPLOYEE_ID, request);

        assertThat(response.isLeaveDecisionEnabled()).isFalse();
        assertThat(response.isNewLeaveRequestEnabled()).isTrue();
        assertThat(response.isAttendanceReminderEnabled()).isFalse();
        verify(preferenceRepository).save(any(NotificationPreference.class));
    }

    @Test
    void update_updatesExistingRow_ratherThanCreatingDuplicate() {
        NotificationPreference existing = new NotificationPreference();
        existing.setEmployeeId(EMPLOYEE_ID);
        when(preferenceRepository.findByEmployeeId(EMPLOYEE_ID)).thenReturn(Optional.of(existing));
        when(preferenceRepository.save(any(NotificationPreference.class))).thenAnswer(inv -> inv.getArgument(0));

        NotificationPreferenceUpdateRequest request = new NotificationPreferenceUpdateRequest();
        request.setLeaveDecisionEnabled(false);
        request.setNewLeaveRequestEnabled(false);
        request.setAttendanceReminderEnabled(false);

        preferenceService.update(EMPLOYEE_ID, request);

        verify(preferenceRepository).save(existing);
        assertThat(existing.isLeaveDecisionEnabled()).isFalse();
    }
}
