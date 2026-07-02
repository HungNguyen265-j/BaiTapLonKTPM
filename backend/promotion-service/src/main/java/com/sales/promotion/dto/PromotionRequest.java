package com.sales.promotion.dto;

import com.sales.promotion.model.Promotion;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionRequest {

    @NotBlank
    @Size(max = 50)
    private String code;

    @NotBlank
    @Size(max = 255)
    private String name;

    private String description;

    @NotNull
    private Promotion.PromotionType type;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal discountValue;

    private BigDecimal maxDiscount;

    @NotNull
    @DecimalMin("0")
    private BigDecimal minOrderValue;

    @NotNull
    @Min(1)
    private Integer usageLimit;

    @NotNull
    @Min(1)
    private Integer usagePerCustomer;

    @NotNull
    private LocalDateTime startDate;

    @NotNull
    private LocalDateTime endDate;

    private String applicableChannels;

    private String applicableProducts;

    private String applicableCategories;

    @NotNull
    private Promotion.PromotionStatus status;

    @NotBlank
    private String createdBy;
}
