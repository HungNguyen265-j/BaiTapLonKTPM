package com.sales.order.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderEvent {

    private String eventId;
    private String orderId;
    private String orderCode;
    private String eventType;
    private LocalDateTime timestamp;

    public static String generateEventId() {
        return UUID.randomUUID().toString();
    }
}
