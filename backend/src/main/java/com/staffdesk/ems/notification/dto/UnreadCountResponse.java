package com.staffdesk.ems.notification.dto;

public class UnreadCountResponse {

    private final long count;

    public UnreadCountResponse(long count) {
        this.count = count;
    }

    public long getCount() {
        return count;
    }
}