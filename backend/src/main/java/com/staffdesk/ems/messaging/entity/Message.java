package com.staffdesk.ems.messaging.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Raw employee ids rather than @ManyToOne, matching the Notification
    // entity's convention — a thread only ever needs the ids to query by,
    // never the full Employee graph.
    @Column(name = "sender_employee_id", nullable = false)
    private Long senderEmployeeId;

    @Column(name = "recipient_employee_id", nullable = false)
    private Long recipientEmployeeId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Long getSenderEmployeeId() {
        return senderEmployeeId;
    }

    public void setSenderEmployeeId(Long senderEmployeeId) {
        this.senderEmployeeId = senderEmployeeId;
    }

    public Long getRecipientEmployeeId() {
        return recipientEmployeeId;
    }

    public void setRecipientEmployeeId(Long recipientEmployeeId) {
        this.recipientEmployeeId = recipientEmployeeId;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}