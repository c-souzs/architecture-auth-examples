package com.souzs.resource.domain.commerce.repository;

import com.souzs.resource.domain.commerce.entity.Order;
import com.souzs.resource.domain.commerce.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findAllByCustomerId(Long customerId);

    List<Order> findAllByStatus(OrderStatus status);

    List<Order> findAllByCustomerIdAndStatus(Long customerId, OrderStatus status);

    List<Order> findAllByCustomer_UserId(Long userId);

    List<Order> findAllByCustomer_UserIdAndStatus(Long userId, OrderStatus status);

    Optional<Order> findByIdAndCustomer_UserId(Long id, Long userId);
}
