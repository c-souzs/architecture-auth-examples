package com.souzs.resource.domain.catalog.repository;

import com.souzs.auth.architecture_auth_examples_back.domain.catalog.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByName(String name);

    boolean existsByName(String name);
}
