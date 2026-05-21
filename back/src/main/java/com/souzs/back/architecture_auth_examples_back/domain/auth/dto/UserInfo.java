package com.souzs.back.architecture_auth_examples_back.domain.auth.dto;

import java.util.List;

public record UserInfo(
        Long id,
        String email,
        String name,
        List<String> roles,
        List<String> authorities
) {}
