package com.souzs.resource.domain.stock.repository;

import com.souzs.resource.domain.stock.entity.Stock;
import com.souzs.resource.domain.stock.entity.StockStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {

    Optional<Stock> findByProductId(Long productId);

    List<Stock> findAllByStatus(StockStatus status);
}
