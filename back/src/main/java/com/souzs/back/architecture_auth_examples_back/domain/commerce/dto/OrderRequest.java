package com.souzs.back.architecture_auth_examples_back.domain.commerce.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record OrderRequest(

        @NotNull
        Long customerId,

        @NotNull
        Long deliveryAddressId,

        @NotEmpty
        List<@Valid OrderItemRequest> items
) {}
