package com.staffdesk.ems.notification.dto;

import com.staffdesk.ems.notification.entity.Notification;

import java.time.Instant;

public class NotificationResponse {

    private final Long id;
    private final Notification.Type type;
    private final String title;
    private final String message;
    private final String link;
    private final boolean read;
    private final Instant createdAt;

    private NotificationResponse(Long id, Notification.Type type, String title, String message,
                                 String link, boolean read, Instant createdAt) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.message = message;
        this.link = link;
        this.read = read;
        this.createdAt = createdAt;
    }

    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getType(), n.getTitle(), n.getMessage(),
                n.getLink(), n.isRead(), n.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public Notification.Type getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public String getLink() {
        return link;
    }

    public boolean isRead() {
        return read;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}