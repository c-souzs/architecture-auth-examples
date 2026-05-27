package com.souzs.shared.security;

import java.util.List;

public record UserPrincipal(
        Long userId,
        String email,
        List<String> roles,
        List<String> authorities
) {}
