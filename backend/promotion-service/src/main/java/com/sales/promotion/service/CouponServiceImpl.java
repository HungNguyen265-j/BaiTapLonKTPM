package com.sales.promotion.service;

import com.sales.promotion.exception.InvalidCouponException;
import com.sales.promotion.exception.PromotionNotFoundException;
import com.sales.promotion.model.Coupon;
import com.sales.promotion.model.Promotion;
import com.sales.promotion.repository.CouponRepository;
import com.sales.promotion.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final PromotionRepository promotionRepository;

    @Override
    @Transactional
    public List<Coupon> generateCoupons(UUID promotionId, int count) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new PromotionNotFoundException("Promotion not found: " + promotionId));

        List<Coupon> coupons = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            Coupon coupon = Coupon.builder()
                    .promotionId(promotionId)
                    .code(generateCouponCode(promotion.getCode()))
                    .status(Coupon.CouponStatus.AVAILABLE)
                    .build();
            coupons.add(coupon);
        }
        return couponRepository.saveAll(coupons);
    }

    @Override
    @Transactional
    public Coupon assignCouponToCustomer(String couponCode, UUID customerId) {
        Coupon coupon = couponRepository.findByCode(couponCode)
                .orElseThrow(() -> new InvalidCouponException("Coupon not found: " + couponCode));

        if (coupon.getStatus() != Coupon.CouponStatus.AVAILABLE) {
            throw new InvalidCouponException("Coupon is not available for assignment");
        }

        coupon.setCustomerId(customerId);
        coupon.setAssignedAt(LocalDateTime.now());
        return couponRepository.save(coupon);
    }

    @Override
    public Coupon validateCoupon(String couponCode) {
        Coupon coupon = couponRepository.findByCode(couponCode)
                .orElseThrow(() -> new InvalidCouponException("Coupon not found: " + couponCode));

        if (coupon.getStatus() != Coupon.CouponStatus.AVAILABLE) {
            throw new InvalidCouponException("Coupon is not available");
        }

        Promotion promotion = promotionRepository.findById(coupon.getPromotionId())
                .orElseThrow(() -> new PromotionNotFoundException("Associated promotion not found"));

        if (promotion.getStatus() != Promotion.PromotionStatus.ACTIVE) {
            throw new InvalidCouponException("Associated promotion is not active");
        }

        return coupon;
    }

    @Override
    public List<Coupon> getCouponsByCustomer(UUID customerId) {
        return couponRepository.findByCustomerId(customerId);
    }

    @Override
    public List<Coupon> getCouponsByPromotion(UUID promotionId) {
        return couponRepository.findByPromotionId(promotionId);
    }

    @Override
    @Transactional
    public Coupon markAsUsed(String couponCode, UUID orderId) {
        Coupon coupon = couponRepository.findByCode(couponCode)
                .orElseThrow(() -> new InvalidCouponException("Coupon not found: " + couponCode));

        if (coupon.getStatus() != Coupon.CouponStatus.AVAILABLE) {
            throw new InvalidCouponException("Coupon is not available for use");
        }

        coupon.setStatus(Coupon.CouponStatus.USED);
        coupon.setUsedAt(LocalDateTime.now());
        coupon.setUsedInOrderId(orderId);

        Promotion promotion = promotionRepository.findById(coupon.getPromotionId())
                .orElseThrow(() -> new PromotionNotFoundException("Associated promotion not found"));
        promotion.setUsedCount(promotion.getUsedCount() + 1);
        promotionRepository.save(promotion);

        return couponRepository.save(coupon);
    }

    private String generateCouponCode(String prefix) {
        String uuidPart = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return prefix + "-" + uuidPart;
    }
}
