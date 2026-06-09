package com.souzs.resource.domain.stock.service;

import com.souzs.resource.domain.stock.dto.StockCountRequest;
import com.souzs.resource.domain.stock.dto.StockCountResponse;
import com.souzs.resource.domain.stock.entity.Stock;
import com.souzs.resource.domain.stock.entity.StockCount;
import com.souzs.resource.domain.stock.entity.StockStatus;
import com.souzs.resource.domain.stock.repository.StockCountRepository;
import com.souzs.resource.domain.stock.repository.StockRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StockCountService {

    private final StockCountRepository stockCountRepository;
    private final StockRepository stockRepository;

    @Transactional(readOnly = true)
    public List<StockCountResponse> findAllByStock(Long stockId) {
        if (!stockRepository.existsById(stockId)) {
            throw new EntityNotFoundException("Estoque não encontrado: " + stockId);
        }
        return stockCountRepository.findAllByStockId(stockId).stream()
                .map(StockCountResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StockCountResponse> findAllByUser(Long userId) {
        return stockCountRepository.findAllByCountedByUserId(userId).stream()
                .map(StockCountResponse::from)
                .toList();
    }

    public StockCountResponse submit(Long stockId, Long userId, StockCountRequest request) {
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new EntityNotFoundException("Estoque não encontrado: " + stockId));

        if (stock.getStatus() != StockStatus.PENDING_COUNT) {
            throw new IllegalStateException("Contagem só permitida em estoques com status PENDING_COUNT");
        }

        StockCount count = new StockCount();
        count.setStock(stock);
        count.setCountedByUserId(userId);
        count.setCountedQuantity(request.countedQuantity());
        stockCountRepository.save(count);

        if (request.countedQuantity().equals(stock.getQuantity())) {
            stock.setStatus(StockService.resolveStatus(stock.getQuantity(), stock.getMinQuantity()));
        } else {
            stock.setStatus(StockStatus.DIVERGENT);
        }

        return StockCountResponse.from(count);
    }
}
