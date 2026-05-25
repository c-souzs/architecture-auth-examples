package com.souzs.back.architecture_auth_examples_back.domain.catalog.dto;

import com.souzs.back.architecture_auth_examples_back.domain.catalog.entity.Product;

import java.math.BigDecimal;

public record ProductCatalogResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        Long categoryId,
        String categoryName
) {

    public static ProductCatalogResponse from(Product product) {
        return new ProductCatalogResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getCategory().getId(),
                product.getCategory().getName()
        );
    }
}
