package com.souzs.back.architecture_auth_examples_back.domain.auth.dto;

import com.souzs.back.architecture_auth_examples_back.domain.auth.entity.Authority;
import com.souzs.back.architecture_auth_examples_back.domain.auth.entity.Role;
import com.souzs.back.architecture_auth_examples_back.domain.auth.entity.User;

import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

public record UserSummaryResponse(
        Long id,
        String email,
        String name,
        boolean enabled,
        boolean locked,
        Instant createdAt,
        Set<String> roles,
        Set<String> authorities
) {
    public static UserSummaryResponse from(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
        Set<String> authorities = user.getRoles().stream()
                .flatMap(r -> r.getAuthorities().stream())
                .map(Authority::getName)
                .collect(Collectors.toSet());
        return new UserSummaryResponse(
                user.getId(), user.getEmail(), user.getName(),
                user.isEnabled(), user.isLocked(), user.getCreatedAt(),
                roles, authorities
        );
    }
}
