package com.souzs.back.architecture_auth_examples_back.domain.catalog.service;

import com.souzs.back.architecture_auth_examples_back.domain.catalog.dto.CategoryRequest;
import com.souzs.back.architecture_auth_examples_back.domain.catalog.dto.CategoryResponse;
import com.souzs.back.architecture_auth_examples_back.domain.catalog.entity.Category;
import com.souzs.back.architecture_auth_examples_back.domain.catalog.repository.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse findById(Long id) {
        return categoryRepository.findById(id)
                .map(CategoryResponse::from)
                .orElseThrow(() -> new EntityNotFoundException("Categoria não encontrada: " + id));
    }

    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByName(request.name())) {
            throw new IllegalStateException("Categoria já existe: " + request.name());
        }
        Category category = new Category();
        category.setName(request.name());
        category.setDescription(request.description());
        return CategoryResponse.from(categoryRepository.save(category));
    }

    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Categoria não encontrada: " + id));

        if (!category.getName().equals(request.name()) && categoryRepository.existsByName(request.name())) {
            throw new IllegalStateException("Categoria já existe: " + request.name());
        }

        category.setName(request.name());
        category.setDescription(request.description());
        return CategoryResponse.from(category);
    }

    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new EntityNotFoundException("Categoria não encontrada: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
