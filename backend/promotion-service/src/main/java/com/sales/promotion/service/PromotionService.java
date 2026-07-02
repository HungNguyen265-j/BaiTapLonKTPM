package com.sales.promotion.service;

import com.sales.promotion.dto.PromotionRequest;
import com.sales.promotion.dto.PromotionResponse;
import com.sales.promotion.dto.ValidateCouponRequest;
import com.sales.promotion.dto.ValidateCouponResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PromotionService {

    PromotionResponse createPromotion(PromotionRequest request);

    PromotionResponse updatePromotion(UUID id, PromotionRequest request);

    PromotionResponse getPromotion(UUID id);

    PromotionResponse getPromotionByCode(String code);

    Page<PromotionResponse> getAllPromotions(Pageable pageable);

    void deletePromotion(UUID id);

    PromotionResponse activatePromotion(UUID id);

    PromotionResponse disablePromotion(UUID id);

    ValidateCouponResponse validateCoupon(ValidateCouponRequest request);
}
