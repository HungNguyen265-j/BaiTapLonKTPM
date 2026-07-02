package com.sales.promotion.controller;

import com.sales.promotion.dto.PromotionRequest;
import com.sales.promotion.dto.PromotionResponse;
import com.sales.promotion.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @PostMapping
    public ResponseEntity<PromotionResponse> createPromotion(@Valid @RequestBody PromotionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(promotionService.createPromotion(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PromotionResponse> updatePromotion(@PathVariable UUID id,
                                                             @Valid @RequestBody PromotionRequest request) {
        return ResponseEntity.ok(promotionService.updatePromotion(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromotionResponse> getPromotion(@PathVariable UUID id) {
        return ResponseEntity.ok(promotionService.getPromotion(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<PromotionResponse> getPromotionByCode(@PathVariable String code) {
        return ResponseEntity.ok(promotionService.getPromotionByCode(code));
    }

    @GetMapping
    public ResponseEntity<Page<PromotionResponse>> getAllPromotions(Pageable pageable) {
        return ResponseEntity.ok(promotionService.getAllPromotions(pageable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePromotion(@PathVariable UUID id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<PromotionResponse> activatePromotion(@PathVariable UUID id) {
        return ResponseEntity.ok(promotionService.activatePromotion(id));
    }

    @PostMapping("/{id}/disable")
    public ResponseEntity<PromotionResponse> disablePromotion(@PathVariable UUID id) {
        return ResponseEntity.ok(promotionService.disablePromotion(id));
    }
}
