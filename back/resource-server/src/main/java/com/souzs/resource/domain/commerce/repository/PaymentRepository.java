package com.souzs.resource.domain.commerce.repository;

import com.souzs.auth.architecture_auth_examples_back.domain.commerce.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderId(Long orderId);
}
