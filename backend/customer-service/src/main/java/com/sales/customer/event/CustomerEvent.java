package com.sales.customer.event;

import lombok.*;
import lombok.experimental.SuperBuilder;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@SuperBuilder
public class CustomerEvent {

    private UUID customerId;
    private String eventType;
    private LocalDateTime timestamp;

    public CustomerEvent(UUID customerId, String eventType) {
        this.customerId = customerId;
        this.eventType = eventType;
        this.timestamp = LocalDateTime.now();
    }
}
