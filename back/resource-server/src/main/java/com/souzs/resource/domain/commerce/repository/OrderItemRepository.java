package com.souzs.resource.domain.commerce.repository;

import com.souzs.auth.architecture_auth_examples_back.domain.commerce.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findAllByOrderId(Long orderId);
}
