package com.souzs.resource.domain.catalog.dto;

import com.souzs.resource.domain.catalog.entity.Product;
import com.souzs.resource.domain.catalog.entity.ProductStatus;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        ProductStatus status,
        Long categoryId,
        String categoryName
) {

    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStatus(),
                product.getCategory().getId(),
                product.getCategory().getName()
        );
    }
}
