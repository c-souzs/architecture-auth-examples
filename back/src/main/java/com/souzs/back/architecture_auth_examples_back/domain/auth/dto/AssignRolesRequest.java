package com.souzs.back.architecture_auth_examples_back.domain.auth.dto;

import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record AssignRolesRequest(@NotNull Set<String> roleNames) {}
