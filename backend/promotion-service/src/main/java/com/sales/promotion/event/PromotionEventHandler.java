package com.sales.promotion.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sales.promotion.model.Promotion;
import com.sales.promotion.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class PromotionEventHandler {

    private final PromotionRepository promotionRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "order-events", groupId = "promotion-service")
    public void handleOrderEvent(String message) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> event = objectMapper.readValue(message, Map.class);
            String eventType = (String) event.get("eventType");

            log.info("Received order event: {}", eventType);

            switch (eventType) {
                case "ORDER_CANCELLED" -> handleOrderCancelled(event);
                case "ORDER_COMPLETED" -> handleOrderCompleted(event);
                default -> log.debug("Unhandled order event type: {}", eventType);
            }
        } catch (Exception e) {
            log.error("Failed to process order event", e);
        }
    }

    private void handleOrderCancelled(Map<String, Object> event) {
        String couponCode = (String) event.get("couponCode");
        if (couponCode != null) {
            log.info("Order cancelled, coupon {} may need to be released", couponCode);
        }
    }

    private void handleOrderCompleted(Map<String, Object> event) {
        String promotionCode = (String) event.get("promotionCode");
        if (promotionCode != null) {
            Optional<Promotion> promotionOpt = promotionRepository.findByCode(promotionCode);
            promotionOpt.ifPresent(promotion -> {
                promotion.setUsedCount(promotion.getUsedCount() + 1);
                promotionRepository.save(promotion);
                log.info("Incremented used count for promotion: {}", promotionCode);
            });
        }
    }
}
