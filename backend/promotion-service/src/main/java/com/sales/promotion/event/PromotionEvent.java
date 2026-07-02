package com.sales.promotion.event;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionEvent {

    private String eventType;
    private UUID promotionId;
    private String code;
    private String name;
    private String status;
    private LocalDateTime timestamp;
}
