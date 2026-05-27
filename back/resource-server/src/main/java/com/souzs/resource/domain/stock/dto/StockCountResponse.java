package com.souzs.resource.domain.stock.dto;

import com.souzs.resource.domain.stock.entity.StockCount;

import java.time.Instant;

public record StockCountResponse(
        Long id,
        Long stockId,
        String productName,
        Long countedByUserId,
        Integer countedQuantity,
        Instant countedAt
) {
    public static StockCountResponse from(StockCount sc) {
        return new StockCountResponse(
                sc.getId(),
                sc.getStock().getId(),
                sc.getStock().getProduct().getName(),
                sc.getCountedByUserId(),
                sc.getCountedQuantity(),
                sc.getCountedAt()
        );
    }
}
