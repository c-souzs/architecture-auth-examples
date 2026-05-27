package com.souzs.resource.domain.stock.dto;

import com.souzs.resource.domain.stock.entity.Stock;
import com.souzs.resource.domain.stock.entity.StockStatus;

import java.time.Instant;

public record StockResponse(
        Long id,
        Long productId,
        String productName,
        Integer quantity,
        Integer minQuantity,
        StockStatus status,
        Instant updatedAt
) {

    public static StockResponse from(Stock stock) {
        return new StockResponse(
                stock.getId(),
                stock.getProduct().getId(),
                stock.getProduct().getName(),
                stock.getQuantity(),
                stock.getMinQuantity(),
                stock.getStatus(),
                stock.getUpdatedAt()
        );
    }
}
