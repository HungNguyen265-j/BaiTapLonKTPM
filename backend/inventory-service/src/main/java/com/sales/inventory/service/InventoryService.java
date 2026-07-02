package com.sales.inventory.service;

import com.sales.inventory.dto.InventoryResponse;
import com.sales.inventory.dto.InventoryTransferRequest;
import com.sales.inventory.model.Inventory;

import java.util.List;
import java.util.UUID;

public interface InventoryService {

    InventoryResponse createInventory(Inventory inventory);

    InventoryResponse updateInventory(UUID id, Inventory inventory);

    InventoryResponse getInventoryById(UUID id);

    InventoryResponse getByProductAndWarehouse(UUID productId, UUID warehouseId);

    List<InventoryResponse> getByProductId(UUID productId);

    List<InventoryResponse> getBySku(String sku);

    List<InventoryResponse> getByWarehouseId(UUID warehouseId);

    List<InventoryResponse> getAllInventories();

    InventoryResponse adjustStock(UUID productId, String sku, UUID warehouseId, Integer quantity, String reason);

    InventoryResponse reserveStock(UUID productId, String sku, UUID warehouseId, Integer quantity);

    InventoryResponse releaseReservation(UUID productId, String sku, UUID warehouseId, Integer quantity);

    InventoryResponse transferStock(InventoryTransferRequest request);

    boolean checkAvailability(UUID productId, UUID warehouseId, Integer quantity);

    List<InventoryResponse> getLowStockItems();
}
