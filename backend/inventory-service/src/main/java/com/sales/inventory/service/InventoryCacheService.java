package com.sales.inventory.service;

import com.sales.inventory.dto.InventoryResponse;

import java.util.Optional;
import java.util.UUID;

public interface InventoryCacheService {

    Optional<InventoryResponse> getCachedInventory(UUID productId, UUID warehouseId);

    void cacheInventory(InventoryResponse inventoryResponse);

    void evictInventoryCache(UUID productId, UUID warehouseId);

    void evictAllInventoryCaches();
}
