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
public class LowStockEvent extends InventoryEvent {

    private UUID productId;
    private String sku;
    private UUID warehouseId;
    private Integer currentStock;
    private Integer reorderPoint;
    private String alertType;

    public static LowStockEvent create(UUID productId, String sku, UUID warehouseId,
                                       Integer currentStock, Integer reorderPoint, String alertType) {
        LowStockEvent event = new LowStockEvent();
        event.setEventId(java.util.UUID.randomUUID().toString());
        event.setEventType("LOW_STOCK_ALERT");
        event.setTimestamp(java.time.LocalDateTime.now());
        event.setProductId(productId);
        event.setSku(sku);
        event.setWarehouseId(warehouseId);
        event.setCurrentStock(currentStock);
        event.setReorderPoint(reorderPoint);
        event.setAlertType(alertType);
        return event;
    }
}
