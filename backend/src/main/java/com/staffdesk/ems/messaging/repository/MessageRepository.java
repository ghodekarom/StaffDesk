package com.staffdesk.ems.messaging.repository;

import com.staffdesk.ems.messaging.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // A "thread" is just every message where this pair of employees appears
    // in either sender/recipient role — no separate thread table to keep in
    // sync, just a query over both directions of the pair.
    @Query("""
            select m from Message m
            where (m.senderEmployeeId = :employeeId and m.recipientEmployeeId = :otherEmployeeId)
               or (m.senderEmployeeId = :otherEmployeeId and m.recipientEmployeeId = :employeeId)
            """)
    Page<Message> findThread(@Param("employeeId") Long employeeId,
                             @Param("otherEmployeeId") Long otherEmployeeId,
                             Pageable pageable);

    long countByRecipientEmployeeIdAndReadFalse(Long recipientEmployeeId);

    long countByRecipientEmployeeIdAndSenderEmployeeIdAndReadFalse(Long recipientEmployeeId, Long senderEmployeeId);

    // Backs the inbox list: newest-first messages where this employee is
    // either side of the conversation. The service groups these by "other
    // party" in memory, keeping the first (most recent) per partner — that
    // avoids a GROUP BY/window-function query for what's a modest table at
    // this app's scale, and keeps the logic readable in Java rather than JPQL.
    Page<Message> findBySenderEmployeeIdOrRecipientEmployeeIdOrderByCreatedAtDesc(
            Long senderEmployeeId, Long recipientEmployeeId, Pageable pageable);

    // Bulk mark-as-read for one side of a thread — called whenever the
    // recipient opens or polls the conversation, so the unread badge on the
    // other person's messages clears without a round trip per message.
    @Modifying
    @Query("""
            update Message m set m.read = true
            where m.recipientEmployeeId = :employeeId
              and m.senderEmployeeId = :otherEmployeeId
              and m.read = false
            """)
    void markThreadRead(@Param("employeeId") Long employeeId, @Param("otherEmployeeId") Long otherEmployeeId);
}