package com.sales.inventory.event;

import com.sales.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryEventHandler {

    private final InventoryService inventoryService;

    @KafkaListener(topics = "order-events", groupId = "${spring.kafka.consumer.group-id}")
    public void handleOrderEvent(Map<String, Object> event) {
        String eventType = (String) event.get("eventType");
        if (eventType == null) return;

        switch (eventType) {
            case "ORDER_CREATED" -> handleOrderCreated(event);
            case "ORDER_CANCELLED" -> handleOrderCancelled(event);
            case "ORDER_SHIPPED" -> handleOrderShipped(event);
            default -> log.debug("Unhandled event type: {}", eventType);
        }
    }

    private void handleOrderCreated(Map<String, Object> event) {
        try {
            UUID productId = UUID.fromString((String) event.get("productId"));
            String sku = (String) event.get("sku");
            UUID warehouseId = UUID.fromString((String) event.get("warehouseId"));
            Integer quantity = (Integer) event.get("quantity");
            String orderId = (String) event.get("orderId");

            inventoryService.reserveStock(productId, sku, warehouseId, quantity);
            log.info("Reserved stock for order {}: {} units of SKU {}", orderId, quantity, sku);
        } catch (Exception e) {
            log.error("Failed to reserve stock for order event: {}", e.getMessage());
        }
    }

    private void handleOrderCancelled(Map<String, Object> event) {
        try {
            UUID productId = UUID.fromString((String) event.get("productId"));
            String sku = (String) event.get("sku");
            UUID warehouseId = UUID.fromString((String) event.get("warehouseId"));
            Integer quantity = (Integer) event.get("quantity");

            inventoryService.releaseReservation(productId, sku, warehouseId, quantity);
            log.info("Released reservation for SKU {}: {} units", sku, quantity);
        } catch (Exception e) {
            log.error("Failed to release reservation for cancelled order: {}", e.getMessage());
        }
    }

    private void handleOrderShipped(Map<String, Object> event) {
        try {
            UUID productId = UUID.fromString((String) event.get("productId"));
            String sku = (String) event.get("sku");
            UUID warehouseId = UUID.fromString((String) event.get("warehouseId"));
            Integer quantity = (Integer) event.get("quantity");

            inventoryService.releaseReservation(productId, sku, warehouseId, quantity);
            inventoryService.adjustStock(productId, sku, warehouseId, -quantity, "ORDER_SHIPPED");
            log.info("Stock deducted for shipped order: {} units of SKU {}", quantity, sku);
        } catch (Exception e) {
            log.error("Failed to process shipped order: {}", e.getMessage());
        }
    }
}
