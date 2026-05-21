package com.souzs.back.architecture_auth_examples_back.domain.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(

        @NotBlank @Email
        String email,

        @NotBlank
        String password
) {}
