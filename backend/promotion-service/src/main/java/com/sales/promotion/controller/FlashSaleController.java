package com.sales.promotion.controller;

import com.sales.promotion.model.FlashSale;
import com.sales.promotion.service.FlashSaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/flash-sales")
@RequiredArgsConstructor
public class FlashSaleController {

    private final FlashSaleService flashSaleService;

    @PostMapping
    public ResponseEntity<FlashSale> createFlashSale(@Valid @RequestBody FlashSale flashSale) {
        return ResponseEntity.status(HttpStatus.CREATED).body(flashSaleService.createFlashSale(flashSale));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlashSale> updateFlashSale(@PathVariable UUID id,
                                                     @Valid @RequestBody FlashSale flashSale) {
        return ResponseEntity.ok(flashSaleService.updateFlashSale(id, flashSale));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlashSale> getFlashSale(@PathVariable UUID id) {
        return ResponseEntity.ok(flashSaleService.getFlashSale(id));
    }

    @GetMapping
    public ResponseEntity<List<FlashSale>> getAllFlashSales() {
        return ResponseEntity.ok(flashSaleService.getAllFlashSales());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlashSale(@PathVariable UUID id) {
        flashSaleService.deleteFlashSale(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<FlashSale> activateFlashSale(@PathVariable UUID id) {
        return ResponseEntity.ok(flashSaleService.activateFlashSale(id));
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<FlashSale> endFlashSale(@PathVariable UUID id) {
        return ResponseEntity.ok(flashSaleService.endFlashSale(id));
    }

    @GetMapping("/active")
    public ResponseEntity<List<FlashSale>> getActiveFlashSales() {
        return ResponseEntity.ok(flashSaleService.getActiveFlashSales());
    }
}
