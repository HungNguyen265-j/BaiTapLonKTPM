package com.sales.promotion.service;

import com.sales.promotion.model.Coupon;

import java.util.List;
import java.util.UUID;

public interface CouponService {

    List<Coupon> generateCoupons(UUID promotionId, int count);

    Coupon assignCouponToCustomer(String couponCode, UUID customerId);

    Coupon validateCoupon(String couponCode);

    List<Coupon> getCouponsByCustomer(UUID customerId);

    List<Coupon> getCouponsByPromotion(UUID promotionId);

    Coupon markAsUsed(String couponCode, UUID orderId);
}
