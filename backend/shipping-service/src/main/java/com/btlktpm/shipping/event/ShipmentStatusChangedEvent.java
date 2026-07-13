package com.btlktpm.shipping.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentStatusChangedEvent {

    private UUID shipmentId;
    private UUID orderId;
    private String trackingCode;
    private String oldStatus;
    private String newStatus;
    private String description;
}
