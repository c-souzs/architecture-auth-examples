package com.souzs.resource.domain.stock.service;

import com.souzs.auth.architecture_auth_examples_back.domain.auth.entity.User;
import com.souzs.auth.architecture_auth_examples_back.domain.auth.repository.UserRepository;
import com.souzs.auth.architecture_auth_examples_back.domain.stock.dto.StockCountRequest;
import com.souzs.auth.architecture_auth_examples_back.domain.stock.dto.StockCountResponse;
import com.souzs.auth.architecture_auth_examples_back.domain.stock.entity.Stock;
import com.souzs.auth.architecture_auth_examples_back.domain.stock.entity.StockCount;
import com.souzs.auth.architecture_auth_examples_back.domain.stock.entity.StockStatus;
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
    private final UserRepository userRepository;

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
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("Usuário não encontrado: " + userId);
        }
        return stockCountRepository.findAllByCountedById(userId).stream()
                .map(StockCountResponse::from)
                .toList();
    }

    // STOCK_INTERN submete contagem física
    // Compara com quantidade de referência e atualiza status do estoque
    public StockCountResponse submit(Long stockId, StockCountRequest request) {
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new EntityNotFoundException("Estoque não encontrado: " + stockId));

        if (stock.getStatus() != StockStatus.PENDING_COUNT) {
            throw new IllegalStateException("Contagem só permitida em estoques com status PENDING_COUNT");
        }

        User countedBy = userRepository.findById(request.countedByUserId())
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado: " + request.countedByUserId()));

        StockCount count = new StockCount();
        count.setStock(stock);
        count.setCountedBy(countedBy);
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
