package com.souzs.shared.security;

import java.util.List;

public record UserPrincipal(
        Long userId,
        String email,
        String name,
        List<String> roles,
        List<String> authorities
) {}
