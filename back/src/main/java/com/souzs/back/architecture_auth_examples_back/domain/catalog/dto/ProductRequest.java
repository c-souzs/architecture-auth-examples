package com.souzs.back.architecture_auth_examples_back.domain.catalog.dto;

import com.souzs.back.architecture_auth_examples_back.domain.catalog.entity.ProductStatus;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ProductRequest(

        @NotBlank @Size(max = 150)
        String name,

        @Size(max = 500)
        String description,

        @NotNull @DecimalMin("0.01") @Digits(integer = 17, fraction = 2)
        BigDecimal price,

        ProductStatus status,

        @NotNull
        Long categoryId
) {}
