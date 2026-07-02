package com.sales.product.service;

import com.sales.product.event.ProductSyncEvent;
import com.sales.product.exception.ProductSyncException;
import com.sales.product.model.ProductChannel;
import com.sales.product.model.SalesChannel;
import com.sales.product.model.SyncStatus;
import com.sales.product.repository.ProductChannelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductSyncService {

    private final ProductChannelRepository productChannelRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Transactional
    public void syncToChannel(UUID productId, SalesChannel channel) {
        ProductChannel productChannel = productChannelRepository
                .findByProductIdAndChannel(productId, channel)
                .orElseThrow(() -> new ProductSyncException(
                        "Product channel mapping not found for product: " + productId + ", channel: " + channel));

        productChannel.setSyncStatus(SyncStatus.SYNCING);
        productChannelRepository.save(productChannel);

        ProductSyncEvent event = new ProductSyncEvent();
        event.setProductId(productId.toString());
        event.setChannel(channel.name());
        event.setEventType("PRODUCT_SYNC");

        try {
            kafkaTemplate.send("product-sync-events", event).whenComplete((result, ex) -> {
                if (ex != null) {
                    productChannel.setSyncStatus(SyncStatus.FAILED);
                    productChannelRepository.save(productChannel);
                    log.error("Failed to sync product {} to channel {}", productId, channel, ex);
                } else {
                    productChannel.setSyncStatus(SyncStatus.SYNCED);
                    productChannel.setLastSyncAt(LocalDateTime.now());
                    productChannelRepository.save(productChannel);
                    log.info("Product {} synced to channel {} successfully", productId, channel);
                }
            });
        } catch (Exception e) {
            productChannel.setSyncStatus(SyncStatus.FAILED);
            productChannelRepository.save(productChannel);
            throw new ProductSyncException("Failed to sync product " + productId + " to channel " + channel, e);
        }
    }

    @Transactional
    public void updateSyncStatus(UUID channelId, SyncStatus status, String channelProductId, String channelUrl) {
        ProductChannel productChannel = productChannelRepository.findById(channelId)
                .orElseThrow(() -> new ProductSyncException("ProductChannel not found: " + channelId));

        productChannel.setSyncStatus(status);
        if (channelProductId != null) {
            productChannel.setChannelProductId(channelProductId);
        }
        if (channelUrl != null) {
            productChannel.setChannelUrl(channelUrl);
        }
        if (status == SyncStatus.SYNCED) {
            productChannel.setLastSyncAt(LocalDateTime.now());
        }
        productChannelRepository.save(productChannel);
    }
}
