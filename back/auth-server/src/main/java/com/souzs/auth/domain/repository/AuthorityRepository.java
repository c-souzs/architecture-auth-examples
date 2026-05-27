package com.souzs.auth.domain.repository;

import com.souzs.auth.domain.entity.Authority;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthorityRepository extends JpaRepository<Authority, Long> {

    boolean existsByName(String name);
}
