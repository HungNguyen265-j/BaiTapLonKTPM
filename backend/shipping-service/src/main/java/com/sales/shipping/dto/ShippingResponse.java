package com.sales.shipping.dto;

import com.sales.shipping.model.enums.Carrier;
import com.sales.shipping.model.enums.ShipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingResponse {

    private UUID id;
    private UUID orderId;
    private String orderCode;
    private Carrier carrier;
    private String trackingCode;
    private ShipmentStatus status;
    private BigDecimal shippingFee;
    private LocalDateTime estimatedDelivery;
    private LocalDateTime actualDelivery;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
