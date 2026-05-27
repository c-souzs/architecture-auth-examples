package com.souzs.resource.domain.catalog.repository;

import com.souzs.auth.architecture_auth_examples_back.domain.catalog.entity.Product;
import com.souzs.auth.architecture_auth_examples_back.domain.catalog.entity.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllByCategoryId(Long categoryId);

    List<Product> findAllByStatus(ProductStatus status);
}
