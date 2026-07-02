package com.sales.promotion.repository;

import com.sales.promotion.model.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, UUID> {

    Optional<Coupon> findByCode(String code);

    List<Coupon> findByPromotionId(UUID promotionId);

    List<Coupon> findByCustomerId(UUID customerId);

    List<Coupon> findByStatus(Coupon.CouponStatus status);
}
