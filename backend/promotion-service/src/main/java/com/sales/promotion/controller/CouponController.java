package com.sales.promotion.controller;

import com.sales.promotion.dto.ValidateCouponRequest;
import com.sales.promotion.dto.ValidateCouponResponse;
import com.sales.promotion.model.Coupon;
import com.sales.promotion.service.CouponService;
import com.sales.promotion.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;
    private final PromotionService promotionService;

    @PostMapping("/validate")
    public ResponseEntity<ValidateCouponResponse> validateCoupon(@Valid @RequestBody ValidateCouponRequest request) {
        return ResponseEntity.ok(promotionService.validateCoupon(request));
    }

    @PostMapping("/generate")
    public ResponseEntity<List<Coupon>> generateCoupons(@RequestBody Map<String, Object> request) {
        UUID promotionId = UUID.fromString((String) request.get("promotionId"));
        int count = (int) request.get("count");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(couponService.generateCoupons(promotionId, count));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Coupon>> getCouponsByCustomer(@PathVariable UUID customerId) {
        return ResponseEntity.ok(couponService.getCouponsByCustomer(customerId));
    }

    @PostMapping("/{code}/assign")
    public ResponseEntity<Coupon> assignCoupon(@PathVariable String code, @RequestBody Map<String, UUID> request) {
        return ResponseEntity.ok(couponService.assignCouponToCustomer(code, request.get("customerId")));
    }
}
