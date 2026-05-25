package com.souzs.back.architecture_auth_examples_back.domain.catalog.service;

import com.souzs.back.architecture_auth_examples_back.domain.catalog.dto.ProductCatalogResponse;
import com.souzs.back.architecture_auth_examples_back.domain.catalog.dto.ProductRequest;
import com.souzs.back.architecture_auth_examples_back.domain.catalog.dto.ProductResponse;
import com.souzs.back.architecture_auth_examples_back.domain.catalog.entity.Category;
import com.souzs.back.architecture_auth_examples_back.domain.catalog.entity.Product;
import com.souzs.back.architecture_auth_examples_back.domain.catalog.entity.ProductStatus;
import com.souzs.back.architecture_auth_examples_back.domain.catalog.repository.CategoryRepository;
import com.souzs.back.architecture_auth_examples_back.domain.catalog.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<ProductCatalogResponse> findAllActive() {
        return productRepository.findAllByStatus(ProductStatus.ACTIVE).stream()
                .map(ProductCatalogResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findAll(Long categoryId, ProductStatus status) {
        if (categoryId != null && status != null) {
            return productRepository.findAllByCategoryId(categoryId).stream()
                    .filter(p -> p.getStatus() == status)
                    .map(ProductResponse::from)
                    .toList();
        }
        if (categoryId != null) {
            return productRepository.findAllByCategoryId(categoryId).stream()
                    .map(ProductResponse::from)
                    .toList();
        }
        if (status != null) {
            return productRepository.findAllByStatus(status).stream()
                    .map(ProductResponse::from)
                    .toList();
        }
        return productRepository.findAll().stream()
                .map(ProductResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse findById(Long id) {
        return productRepository.findById(id)
                .map(ProductResponse::from)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + id));
    }

    public ProductResponse create(ProductRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new EntityNotFoundException("Categoria não encontrada: " + request.categoryId()));

        Product product = new Product();
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStatus(request.status() != null ? request.status() : ProductStatus.ACTIVE);
        product.setCategory(category);
        return ProductResponse.from(productRepository.save(product));
    }

    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + id));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new EntityNotFoundException("Categoria não encontrada: " + request.categoryId()));

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStatus(request.status() != null ? request.status() : product.getStatus());
        product.setCategory(category);
        return ProductResponse.from(product);
    }

    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new EntityNotFoundException("Produto não encontrado: " + id);
        }
        productRepository.deleteById(id);
    }
}
