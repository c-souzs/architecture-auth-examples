package com.souzs.back.architecture_auth_examples_back.domain.auth.dto;

public record LoginResponse(
        String accessToken,
        UserInfo user
) {}
