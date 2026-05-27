package com.souzs.auth.domain.dto;

import com.souzs.shared.security.UserPrincipal;

import java.util.List;

public record UserInfo(
        Long userId,
        String email,
        List<String> roles,
        List<String> authorities
) {
    public static UserInfo from(UserPrincipal principal) {
        return new UserInfo(
                principal.userId(),
                principal.email(),
                principal.roles(),
                principal.authorities()
        );
    }
}
