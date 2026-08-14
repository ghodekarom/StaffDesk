package com.staffdesk.ems.notification.repository;

import com.staffdesk.ems.notification.entity.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {

    Optional<NotificationPreference> findByEmployeeId(Long employeeId);
}
