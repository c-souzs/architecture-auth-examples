package com.souzs.back.architecture_auth_examples_back.domain.stock.dto;

import com.souzs.back.architecture_auth_examples_back.domain.stock.entity.StockCount;

import java.time.Instant;

public record StockCountResponse(
        Long id,
        Long stockId,
        String productName,
        Long countedByUserId,
        String countedByName,
        Integer countedQuantity,
        Instant countedAt
) {

    public static StockCountResponse from(StockCount sc) {
        return new StockCountResponse(
                sc.getId(),
                sc.getStock().getId(),
                sc.getStock().getProduct().getName(),
                sc.getCountedBy().getId(),
                sc.getCountedBy().getName(),
                sc.getCountedQuantity(),
                sc.getCountedAt()
        );
    }
}
