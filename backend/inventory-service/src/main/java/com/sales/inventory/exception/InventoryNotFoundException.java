package com.sales.inventory.exception;

import java.util.UUID;

public class InventoryNotFoundException extends RuntimeException {

    public InventoryNotFoundException(String message) {
        super(message);
    }

    public InventoryNotFoundException(UUID productId, UUID warehouseId) {
        super("Inventory not found for productId: " + productId + " and warehouseId: " + warehouseId);
    }
}
