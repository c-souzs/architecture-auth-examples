package com.souzs.resource.domain.stock.repository;

import com.souzs.auth.architecture_auth_examples_back.domain.stock.entity.StockCount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockCountRepository extends JpaRepository<StockCount, Long> {

    List<StockCount> findAllByStockId(Long stockId);

    List<StockCount> findAllByCountedById(Long userId);
}
