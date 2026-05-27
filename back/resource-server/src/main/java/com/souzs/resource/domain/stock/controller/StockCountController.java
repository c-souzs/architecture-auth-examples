package com.souzs.resource.domain.stock.controller;

import com.souzs.resource.domain.stock.dto.StockCountRequest;
import com.souzs.resource.domain.stock.dto.StockCountResponse;
import com.souzs.resource.domain.stock.service.StockCountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stocks/{stockId}/counts")
@RequiredArgsConstructor
public class StockCountController {

    private final StockCountService stockCountService;

    @GetMapping
    public List<StockCountResponse> findAllByStock(@PathVariable Long stockId) {
        return stockCountService.findAllByStock(stockId);
    }

    @PostMapping
    public ResponseEntity<StockCountResponse> submit(
            @PathVariable Long stockId,
            @Valid @RequestBody StockCountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stockCountService.submit(stockId, request));
    }
}
