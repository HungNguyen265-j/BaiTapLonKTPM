package com.sales.inventory.service.impl;

import com.sales.inventory.dto.InventoryResponse;
import com.sales.inventory.service.InventoryCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class InventoryCacheServiceImpl implements InventoryCacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String CACHE_KEY_PREFIX = "inventory:";
    private static final long CACHE_TTL_MINUTES = 10;

    private String buildKey(UUID productId, UUID warehouseId) {
        return CACHE_KEY_PREFIX + productId + ":" + warehouseId;
    }

    @Override
    public Optional<InventoryResponse> getCachedInventory(UUID productId, UUID warehouseId) {
        String key = buildKey(productId, warehouseId);
        InventoryResponse cached = (InventoryResponse) redisTemplate.opsForValue().get(key);
        return Optional.ofNullable(cached);
    }

    @Override
    public void cacheInventory(InventoryResponse inventoryResponse) {
        String key = buildKey(inventoryResponse.getProductId(), inventoryResponse.getWarehouseId());
        redisTemplate.opsForValue().set(key, inventoryResponse, CACHE_TTL_MINUTES, TimeUnit.MINUTES);
    }

    @Override
    public void evictInventoryCache(UUID productId, UUID warehouseId) {
        String key = buildKey(productId, warehouseId);
        redisTemplate.delete(key);
    }

    @Override
    public void evictAllInventoryCaches() {
        redisTemplate.delete(redisTemplate.keys(CACHE_KEY_PREFIX + "*"));
    }
}
