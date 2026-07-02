package com.sales.promotion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidateCouponRequest {

    @NotBlank
    private String couponCode;

    private UUID customerId;

    @NotNull
    private BigDecimal orderTotal;

    private String channel;

    private String productId;

    private String categoryId;
}
