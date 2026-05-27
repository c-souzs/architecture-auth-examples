package com.souzs.resource.domain.stock.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StockValidateRequest(

        @NotNull @Min(0)
        Integer resolvedQuantity
) {}
