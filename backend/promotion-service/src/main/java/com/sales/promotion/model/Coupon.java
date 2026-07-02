package com.sales.promotion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID promotionId;

    @Column(unique = true, nullable = false)
    private String code;

    private UUID customerId;

    private LocalDateTime assignedAt;

    private LocalDateTime usedAt;

    private UUID usedInOrderId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CouponStatus status;

    public enum CouponStatus {
        AVAILABLE, USED, EXPIRED
    }
}
