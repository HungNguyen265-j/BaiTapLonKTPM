package com.sales.order.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sales.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@KafkaListener(topics = "${order.kafka.topic.order-events}", groupId = "${spring.kafka.consumer.group-id}")
@RequiredArgsConstructor
@Slf4j
public class OrderEventHandler {

    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    @KafkaHandler(isDefault = true)
    public void handleOrderEvent(OrderEvent event) {
        log.info("Received order event: type={}, orderId={}", event.getEventType(), event.getOrderId());
    }

    @KafkaHandler
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Order created: code={}, total={}", event.getOrderCode(), event.getTotal());
    }

    @KafkaHandler
    public void handleStatusChanged(OrderStatusChangedEvent event) {
        log.info("Order status changed: orderId={}, from={}, to={}",
                event.getOrderId(), event.getFromStatus(), event.getToStatus());
    }

    @KafkaHandler
    public void handlePaymentProcessed(PaymentProcessedEvent event) {
        log.info("Payment processed: orderId={}, transactionId={}, amount={}",
                event.getOrderId(), event.getTransactionId(), event.getAmount());
    }
}
