package com.souzs.auth.domain.dto;

import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record AssignRolesRequest(@NotNull Set<String> roleNames) {}
