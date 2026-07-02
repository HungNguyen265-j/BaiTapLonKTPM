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
public class StockAdjustedEvent extends InventoryEvent {

    private UUID productId;
    private String sku;
    private UUID warehouseId;
    private Integer oldQuantity;
    private Integer newQuantity;
    private String reason;

    public static StockAdjustedEvent create(UUID productId, String sku, UUID warehouseId,
                                            Integer oldQuantity, Integer newQuantity, String reason) {
        StockAdjustedEvent event = new StockAdjustedEvent();
        event.setEventId(java.util.UUID.randomUUID().toString());
        event.setEventType("STOCK_ADJUSTED");
        event.setTimestamp(java.time.LocalDateTime.now());
        event.setProductId(productId);
        event.setSku(sku);
        event.setWarehouseId(warehouseId);
        event.setOldQuantity(oldQuantity);
        event.setNewQuantity(newQuantity);
        event.setReason(reason);
        return event;
    }
}
