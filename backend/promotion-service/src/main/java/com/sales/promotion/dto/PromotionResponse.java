package com.sales.promotion.dto;

import com.sales.promotion.model.Promotion;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionResponse {

    private UUID id;
    private String code;
    private String name;
    private String description;
    private Promotion.PromotionType type;
    private BigDecimal discountValue;
    private BigDecimal maxDiscount;
    private BigDecimal minOrderValue;
    private Integer usageLimit;
    private Integer usagePerCustomer;
    private Integer usedCount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String applicableChannels;
    private String applicableProducts;
    private String applicableCategories;
    private Promotion.PromotionStatus status;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PromotionResponse fromEntity(Promotion promotion) {
        return PromotionResponse.builder()
                .id(promotion.getId())
                .code(promotion.getCode())
                .name(promotion.getName())
                .description(promotion.getDescription())
                .type(promotion.getType())
                .discountValue(promotion.getDiscountValue())
                .maxDiscount(promotion.getMaxDiscount())
                .minOrderValue(promotion.getMinOrderValue())
                .usageLimit(promotion.getUsageLimit())
                .usagePerCustomer(promotion.getUsagePerCustomer())
                .usedCount(promotion.getUsedCount())
                .startDate(promotion.getStartDate())
                .endDate(promotion.getEndDate())
                .applicableChannels(promotion.getApplicableChannels())
                .applicableProducts(promotion.getApplicableProducts())
                .applicableCategories(promotion.getApplicableCategories())
                .status(promotion.getStatus())
                .createdBy(promotion.getCreatedBy())
                .createdAt(promotion.getCreatedAt())
                .updatedAt(promotion.getUpdatedAt())
                .build();
    }
}
