package com.staffdesk.ems.notification.repository;

import com.staffdesk.ems.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByRecipientEmployeeId(Long recipientEmployeeId, Pageable pageable);

    long countByRecipientEmployeeIdAndReadFalse(Long recipientEmployeeId);

    @Modifying
    @Query("update Notification n set n.read = true " +
            "where n.recipientEmployeeId = :employeeId and n.read = false")
    void markAllReadForEmployee(@Param("employeeId") Long employeeId);
}