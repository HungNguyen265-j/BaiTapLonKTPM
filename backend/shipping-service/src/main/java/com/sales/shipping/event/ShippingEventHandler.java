package com.sales.shipping.event;

import com.sales.shipping.dto.ShippingRequest;
import com.sales.shipping.model.enums.Carrier;
import com.sales.shipping.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ShippingEventHandler {

    private final ShipmentService shipmentService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaListener(topics = "order-created", groupId = "shipping-service-group")
    public void handleOrderCreated(ShipmentCreatedEvent event) {
        log.info("Received order-created event for order: {}", event.getOrderId());
        try {
            ShippingRequest request = ShippingRequest.builder()
                    .orderId(event.getOrderId())
                    .orderCode(event.getOrderCode())
                    .carrier(Carrier.valueOf(event.getCarrier()))
                    .receiverName(event.getReceiverName())
                    .receiverPhone(event.getReceiverPhone())
                    .receiverAddress(event.getReceiverAddress())
                    .toCity(event.getToCity())
                    .toDistrict(event.getToDistrict())
                    .weight(event.getWeight())
                    .cod(event.getCod())
                    .note(event.getNote())
                    .build();

            var response = shipmentService.createShipment(request);

            ShippingEvent shippingEvent = ShippingEvent.created(response.getId(), response.getTrackingCode());
            kafkaTemplate.send("shipping-events", shippingEvent.getEventId(), shippingEvent);
            log.info("Published shipping-created event for shipment: {}", response.getId());
        } catch (Exception e) {
            log.error("Failed to process order-created event", e);
        }
    }

    @KafkaListener(topics = "order-status-changed", groupId = "shipping-service-group")
    public void handleOrderStatusChanged(ShipmentStatusChangedEvent event) {
        log.info("Received order-status-changed event for order: {}", event.getOrderId());
        try {
            var shipments = shipmentService.getShipmentsByOrderId(event.getOrderId());
            for (var shipment : shipments) {
                ShippingEvent shippingEvent = ShippingEvent.statusChanged(
                        shipment.getId(), shipment.getTrackingCode(), event.getNewStatus());
                kafkaTemplate.send("shipping-events", shippingEvent.getEventId(), shippingEvent);
                log.info("Published shipping-status-changed for shipment: {}", shipment.getId());
            }
        } catch (Exception e) {
            log.error("Failed to process order-status-changed event", e);
        }
    }
}
