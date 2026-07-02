package com.sales.product.event;

import com.sales.product.model.SalesChannel;
import com.sales.product.model.SyncStatus;
import com.sales.product.service.ProductSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductEventHandler {

    private final ProductSyncService productSyncService;

    @KafkaListener(topics = "product-events", groupId = "product-service-group")
    public void handleProductEvent(ProductEvent event) {
        log.info("Received product event: type={}, productId={}, sku={}",
                event.getEventType(), event.getProductId(), event.getSku());

        if ("PRODUCT_CREATED".equals(event.getEventType())) {
            log.info("Processing product created: {}", event.getProductId());
        } else if ("PRODUCT_UPDATED".equals(event.getEventType())) {
            log.info("Processing product updated: {}", event.getProductId());
        } else {
            log.warn("Unknown product event type: {}", event.getEventType());
        }
    }

    @KafkaListener(topics = "product-sync-events", groupId = "product-sync-group")
    public void handleProductSyncEvent(ProductSyncEvent event) {
        log.info("Received product sync event: productId={}, channel={}",
                event.getProductId(), event.getChannel());

        try {
            SalesChannel channel = SalesChannel.valueOf(event.getChannel());
            productSyncService.syncToChannel(
                    java.util.UUID.fromString(event.getProductId()),
                    channel
            );
        } catch (Exception e) {
            log.error("Failed to process sync event for product {}: {}",
                    event.getProductId(), e.getMessage(), e);
        }
    }
}
