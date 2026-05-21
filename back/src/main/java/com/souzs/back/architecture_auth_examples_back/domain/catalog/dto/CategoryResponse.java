package com.souzs.back.architecture_auth_examples_back.domain.catalog.dto;

import com.souzs.back.architecture_auth_examples_back.domain.catalog.entity.Category;

public record CategoryResponse(Long id, String name, String description) {

    public static CategoryResponse from(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getDescription());
    }
}
