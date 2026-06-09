package com.souzs.auth.domain.dto;

public record LoginResponse(String accessToken, UserInfo user) {}
