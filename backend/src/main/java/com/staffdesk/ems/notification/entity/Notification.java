package com.staffdesk.ems.notification.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Raw employee id rather than a @ManyToOne, matching Department.headEmployeeId —
    // notifications only ever need the id to filter/query by, never the full
    // Employee graph, so there's no reason to pay for a join/lazy proxy here.
    @Column(name = "recipient_employee_id", nullable = false)
    private Long recipientEmployeeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Type type;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(length = 255)
    private String link;

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

    public Long getRecipientEmployeeId() {
        return recipientEmployeeId;
    }

    public void setRecipientEmployeeId(Long recipientEmployeeId) {
        this.recipientEmployeeId = recipientEmployeeId;
    }

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
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

    public enum Type {
        LEAVE_REQUEST_SUBMITTED,
        LEAVE_REQUEST_APPROVED,
        LEAVE_REQUEST_REJECTED,
        GENERAL
    }
}