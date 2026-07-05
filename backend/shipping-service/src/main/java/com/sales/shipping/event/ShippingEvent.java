package com.sales.shipping.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingEvent {

    private String eventId;
    private String eventType;
    private UUID shipmentId;
    private String trackingCode;
    private String status;
    private LocalDateTime timestamp;

    public static ShippingEvent created(UUID shipmentId, String trackingCode) {
        return ShippingEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType("SHIPMENT_CREATED")
                .shipmentId(shipmentId)
                .trackingCode(trackingCode)
                .status("PENDING")
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static ShippingEvent statusChanged(UUID shipmentId, String trackingCode, String status) {
        return ShippingEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType("SHIPMENT_STATUS_CHANGED")
                .shipmentId(shipmentId)
                .trackingCode(trackingCode)
                .status(status)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
