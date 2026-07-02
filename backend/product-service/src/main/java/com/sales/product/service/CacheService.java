package com.sales.product.service;

import com.sales.product.dto.ProductResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class CacheService {

    private static final String PRODUCT_CACHE_PREFIX = "product:";
    private static final long CACHE_TTL_HOURS = 2;

    private final RedisTemplate<String, Object> redisTemplate;

    public void cacheProduct(String key, ProductResponse product) {
        try {
            redisTemplate.opsForValue().set(
                    PRODUCT_CACHE_PREFIX + key,
                    product,
                    CACHE_TTL_HOURS,
                    TimeUnit.HOURS
            );
        } catch (Exception e) {
            log.warn("Failed to cache product {}: {}", key, e.getMessage());
        }
    }

    public Optional<ProductResponse> getCachedProduct(String key) {
        try {
            Object cached = redisTemplate.opsForValue().get(PRODUCT_CACHE_PREFIX + key);
            if (cached instanceof ProductResponse product) {
                return Optional.of(product);
            }
        } catch (Exception e) {
            log.warn("Failed to retrieve cached product {}: {}", key, e.getMessage());
        }
        return Optional.empty();
    }

    public void evictProductCache(UUID productId) {
        try {
            redisTemplate.delete(PRODUCT_CACHE_PREFIX + productId);
            log.debug("Evicted cache for product {}", productId);
        } catch (Exception e) {
            log.warn("Failed to evict cache for product {}: {}", productId, e.getMessage());
        }
    }

    public void evictAllProductCaches() {
        try {
            var keys = redisTemplate.keys(PRODUCT_CACHE_PREFIX + "*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.debug("Evicted all product caches");
            }
        } catch (Exception e) {
            log.warn("Failed to evict all product caches: {}", e.getMessage());
        }
    }
}
