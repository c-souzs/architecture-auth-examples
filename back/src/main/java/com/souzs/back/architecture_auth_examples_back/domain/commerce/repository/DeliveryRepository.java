package com.souzs.back.architecture_auth_examples_back.domain.commerce.repository;

import com.souzs.back.architecture_auth_examples_back.domain.commerce.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    Optional<Delivery> findByOrderId(Long orderId);
}
