package com.souzs.resource.domain.catalog.controller;

import com.souzs.resource.domain.catalog.dto.ProductCatalogResponse;
import com.souzs.resource.domain.catalog.dto.ProductRequest;
import com.souzs.resource.domain.catalog.dto.ProductResponse;
import com.souzs.resource.domain.catalog.entity.ProductStatus;
import com.souzs.resource.domain.catalog.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/catalog")
    @PreAuthorize("hasAuthority('product:catalog')")
    public List<ProductCatalogResponse> findCatalog() {
        return productService.findCatalog();
    }

    @GetMapping
    @PreAuthorize("hasAuthority('product:read')")
    public List<ProductResponse> findAll(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) ProductStatus status) {
        return productService.findAll(categoryId, status);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('product:read')")
    public ProductResponse findById(@PathVariable Long id) {
        return productService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('product:write')")
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('product:write')")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return productService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('product:delete')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
