package com.souzs.resource.domain.stock.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StockCountRequest(

        @NotNull @Min(0)
        Integer countedQuantity
) {}
