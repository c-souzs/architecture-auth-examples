package com.souzs.back.architecture_auth_examples_back.domain.customer.repository;

import com.souzs.back.architecture_auth_examples_back.domain.customer.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByUserId(Long userId);

    boolean existsByCpf(String cpf);
}
