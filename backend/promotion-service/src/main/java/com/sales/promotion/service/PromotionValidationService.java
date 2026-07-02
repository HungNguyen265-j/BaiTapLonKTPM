package com.sales.promotion.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sales.promotion.exception.InvalidCouponException;
import com.sales.promotion.model.Promotion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PromotionValidationService {

    private final ObjectMapper objectMapper;

    public void validatePromotion(Promotion promotion, BigDecimal orderTotal,
                                  String channel, String productId, String categoryId) {
        if (promotion.getStatus() != Promotion.PromotionStatus.ACTIVE) {
            throw new InvalidCouponException("Promotion is not active");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(promotion.getStartDate()) || now.isAfter(promotion.getEndDate())) {
            throw new InvalidCouponException("Promotion is not within valid date range");
        }

        if (promotion.getUsedCount() >= promotion.getUsageLimit()) {
            throw new InvalidCouponException("Promotion usage limit has been reached");
        }

        if (orderTotal.compareTo(promotion.getMinOrderValue()) < 0) {
            throw new InvalidCouponException(
                    "Minimum order value of " + promotion.getMinOrderValue() + " is required");
        }

        if (channel != null && promotion.getApplicableChannels() != null) {
            if (!isChannelEligible(channel, promotion.getApplicableChannels())) {
                throw new InvalidCouponException("Promotion is not applicable for channel: " + channel);
            }
        }

        if (productId != null && promotion.getApplicableProducts() != null) {
            if (!isProductEligible(productId, promotion.getApplicableProducts())) {
                throw new InvalidCouponException("Promotion is not applicable for product: " + productId);
            }
        }

        if (categoryId != null && promotion.getApplicableCategories() != null) {
            if (!isCategoryEligible(categoryId, promotion.getApplicableCategories())) {
                throw new InvalidCouponException("Promotion is not applicable for category: " + categoryId);
            }
        }
    }

    public BigDecimal calculateDiscount(Promotion promotion, BigDecimal orderTotal) {
        return switch (promotion.getType()) {
            case PERCENTAGE -> {
                BigDecimal discount = orderTotal.multiply(promotion.getDiscountValue().divide(BigDecimal.valueOf(100)));
                if (promotion.getMaxDiscount() != null && discount.compareTo(promotion.getMaxDiscount()) > 0) {
                    yield promotion.getMaxDiscount();
                }
                yield discount;
            }
            case FIXED_AMOUNT -> promotion.getDiscountValue().compareTo(orderTotal) > 0
                    ? orderTotal
                    : promotion.getDiscountValue();
            case FREE_SHIPPING -> BigDecimal.ZERO;
            case BUY_X_GET_Y -> calculateBuyXGetY(promotion, orderTotal);
        };
    }

    private BigDecimal calculateBuyXGetY(Promotion promotion, BigDecimal orderTotal) {
        return promotion.getDiscountValue();
    }

    private boolean isChannelEligible(String channel, String applicableChannelsJson) {
        try {
            List<String> channels = objectMapper.readValue(applicableChannelsJson, new TypeReference<>() {});
            return channels.stream().anyMatch(c -> c.equalsIgnoreCase(channel));
        } catch (JsonProcessingException e) {
            log.error("Failed to parse applicable channels JSON", e);
            return false;
        }
    }

    private boolean isProductEligible(String productId, String applicableProductsJson) {
        try {
            List<String> products = objectMapper.readValue(applicableProductsJson, new TypeReference<>() {});
            return products.stream().anyMatch(p -> p.equals(productId));
        } catch (JsonProcessingException e) {
            log.error("Failed to parse applicable products JSON", e);
            return false;
        }
    }

    private boolean isCategoryEligible(String categoryId, String applicableCategoriesJson) {
        try {
            List<String> categories = objectMapper.readValue(applicableCategoriesJson, new TypeReference<>() {});
            return categories.stream().anyMatch(c -> c.equals(categoryId));
        } catch (JsonProcessingException e) {
            log.error("Failed to parse applicable categories JSON", e);
            return false;
        }
    }
}
