package com.sales.order.controller;

import com.sales.order.dto.OrderRequest;
import com.sales.order.dto.OrderResponse;
import com.sales.order.dto.OrderSearchCriteria;
import com.sales.order.dto.OrderStatusUpdateRequest;
import com.sales.order.dto.PageResponse;
import com.sales.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrder(id));
    }

    @GetMapping("/code/{orderCode}")
    public ResponseEntity<OrderResponse> getOrderByCode(@PathVariable String orderCode) {
        return ResponseEntity.ok(orderService.getOrderByCode(orderCode));
    }

    @GetMapping
    public ResponseEntity<PageResponse<OrderResponse>> searchOrders(OrderSearchCriteria criteria) {
        return ResponseEntity.ok(orderService.searchOrders(criteria));
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<OrderResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) UUID customerId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        OrderSearchCriteria criteria = OrderSearchCriteria.builder()
                .keyword(keyword).status(status).source(source).customerId(customerId)
                .startDate(startDate).endDate(endDate).page(page).size(size)
                .sortBy(sortBy).sortDir(sortDir).build();
        return ResponseEntity.ok(orderService.searchOrders(criteria));
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable UUID id,
            @RequestBody OrderStatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateStatus(id, request));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.cancelOrder(id));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<OrderResponse.OrderHistoryResponse>> getOrderHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrderHistory(id));
    }

    @PostMapping("/webhook/{source}")
    public ResponseEntity<OrderResponse> processWebhook(
            @PathVariable String source,
            @RequestBody Object webhookPayload) {
        return ResponseEntity.ok(orderService.processWebhook(source, webhookPayload));
    }
}
