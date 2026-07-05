package com.sales.shipping.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentCreatedEvent {

    private UUID orderId;
    private String orderCode;
    private String carrier;
    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;
    private String toCity;
    private String toDistrict;
    private BigDecimal weight;
    private BigDecimal cod;
    private String note;
}
