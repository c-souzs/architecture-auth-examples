package com.souzs.back.architecture_auth_examples_back.domain.commerce.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record OrderItemRequest(

        @NotNull
        Long productId,

        @NotNull @Min(1)
        Integer quantity
) {}
