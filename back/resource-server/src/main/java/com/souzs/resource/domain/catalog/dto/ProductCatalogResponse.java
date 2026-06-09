package com.souzs.resource.domain.catalog.dto;

import com.souzs.resource.domain.catalog.entity.Product;
import com.souzs.resource.domain.catalog.entity.ProductStatus;

import java.math.BigDecimal;
import java.util.List;

public record ProductCatalogResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        Long categoryId,
        String categoryName
) {
    public static ProductCatalogResponse from(Product p) {
        return new ProductCatalogResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getCategory().getId(),
                p.getCategory().getName()
        );
    }

    public static List<ProductCatalogResponse> fromActive(List<Product> products) {
        return products.stream()
                .filter(p -> p.getStatus() == ProductStatus.ACTIVE)
                .map(ProductCatalogResponse::from)
                .toList();
    }
}
