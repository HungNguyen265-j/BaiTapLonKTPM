package com.sales.product.controller;

import com.sales.product.dto.*;
import com.sales.product.model.SalesChannel;
import com.sales.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable UUID id) {
        ProductResponse response = productService.getProduct(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sku/{sku}")
    public ResponseEntity<ProductResponse> getProductBySku(@PathVariable String sku) {
        ProductResponse response = productService.getProductBySku(sku);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ProductResponse> getProductBySlug(@PathVariable String slug) {
        ProductResponse response = productService.getProductBySlug(slug);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<ProductResponse>> searchProducts(ProductSearchCriteria criteria) {
        PageResponse<ProductResponse> response = productService.searchProducts(criteria);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/channels")
    public ResponseEntity<List<ProductChannelResponse>> getProductChannels(@PathVariable UUID id) {
        List<ProductChannelResponse> response = productService.getProductChannels(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/sync")
    public ResponseEntity<Void> syncProductToChannels(
            @PathVariable UUID id,
            @Valid @RequestBody ProductSyncRequest request) {
        productService.syncProductToChannels(id, request.getChannels());
        return ResponseEntity.accepted().build();
    }
}
