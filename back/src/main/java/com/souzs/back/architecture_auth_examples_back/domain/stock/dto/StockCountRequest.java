package com.souzs.back.architecture_auth_examples_back.domain.stock.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StockCountRequest(

        @NotNull
        Long countedByUserId,

        @NotNull @Min(0)
        Integer countedQuantity
) {}
