package com.staffdesk.ems.auth.dto;

import com.staffdesk.ems.auth.entity.User;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        long expiresIn, // seconds
        Long employeeId,
        User.Role role
) {

    public static LoginResponse fromMilliseconds(
            String accessToken,
            String refreshToken,
            long expiresInMs,
            Long employeeId,
            User.Role role
    ) {
        return new LoginResponse(
                accessToken,
                refreshToken,
                expiresInMs / 1000,
                employeeId,
                role
        );
    }
}