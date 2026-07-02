package com.sales.inventory.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryEvent {

    private String eventId;
    private String eventType;
    private LocalDateTime timestamp;

    public static InventoryEvent create(String eventType) {
        return new InventoryEvent(
                UUID.randomUUID().toString(),
                eventType,
                LocalDateTime.now()
        );
    }
}
