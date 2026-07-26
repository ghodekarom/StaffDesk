package com.staffdesk.ems.auth.dto;

import com.staffdesk.ems.auth.entity.User;

public record UserResponse(
        Long id,
        Long employeeId,
        String email,
        User.Role role
) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmployee().getId(), user.getEmail(), user.getRole());
    }
}
