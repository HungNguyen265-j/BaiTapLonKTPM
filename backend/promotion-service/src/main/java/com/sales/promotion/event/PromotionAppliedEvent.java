package com.sales.promotion.event;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionAppliedEvent {

    private UUID promotionId;
    private String promotionCode;
    private UUID couponId;
    private String couponCode;
    private UUID customerId;
    private BigDecimal discountAmount;
    private LocalDateTime appliedAt;
}
