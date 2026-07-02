package com.sales.promotion.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidateCouponResponse {

    private boolean valid;
    private BigDecimal discountAmount;
    private String promotionName;
    private String message;
}
