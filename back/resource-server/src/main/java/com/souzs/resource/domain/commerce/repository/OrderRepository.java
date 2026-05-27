package com.souzs.resource.domain.commerce.repository;

import com.souzs.auth.architecture_auth_examples_back.domain.commerce.entity.Order;
import com.souzs.auth.architecture_auth_examples_back.domain.commerce.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findAllByCustomerId(Long customerId);

    List<Order> findAllByStatus(OrderStatus status);

    List<Order> findAllByCustomerIdAndStatus(Long customerId, OrderStatus status);
}
