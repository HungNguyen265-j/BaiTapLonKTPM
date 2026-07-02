package com.sales.inventory.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class InventoryReservedEvent extends InventoryEvent {

    private UUID productId;
    private String sku;
    private UUID warehouseId;
    private Integer quantityReserved;
    private String orderId;
    private boolean success;

    public static InventoryReservedEvent create(UUID productId, String sku, UUID warehouseId,
                                                Integer quantityReserved, String orderId, boolean success) {
        InventoryReservedEvent event = new InventoryReservedEvent();
        event.setEventId(java.util.UUID.randomUUID().toString());
        event.setEventType(success ? "INVENTORY_RESERVED" : "INVENTORY_RESERVATION_FAILED");
        event.setTimestamp(java.time.LocalDateTime.now());
        event.setProductId(productId);
        event.setSku(sku);
        event.setWarehouseId(warehouseId);
        event.setQuantityReserved(quantityReserved);
        event.setOrderId(orderId);
        event.setSuccess(success);
        return event;
    }
}
