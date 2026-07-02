package com.sales.promotion.service;

import com.sales.promotion.dto.*;
import com.sales.promotion.event.PromotionEvent;
import com.sales.promotion.event.PromotionAppliedEvent;
import com.sales.promotion.exception.InvalidCouponException;
import com.sales.promotion.exception.PromotionNotFoundException;
import com.sales.promotion.model.Coupon;
import com.sales.promotion.model.Promotion;
import com.sales.promotion.repository.CouponRepository;
import com.sales.promotion.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final CouponRepository couponRepository;
    private final PromotionValidationService validationService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public PromotionResponse createPromotion(PromotionRequest request) {
        Promotion promotion = Promotion.builder()
                .code(request.getCode().toUpperCase())
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .discountValue(request.getDiscountValue())
                .maxDiscount(request.getMaxDiscount())
                .minOrderValue(request.getMinOrderValue())
                .usageLimit(request.getUsageLimit())
                .usagePerCustomer(request.getUsagePerCustomer())
                .usedCount(0)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .applicableChannels(request.getApplicableChannels())
                .applicableProducts(request.getApplicableProducts())
                .applicableCategories(request.getApplicableCategories())
                .status(request.getStatus())
                .createdBy(request.getCreatedBy())
                .build();

        promotion = promotionRepository.save(promotion);
        publishPromotionEvent(promotion, "PROMOTION_CREATED");
        return PromotionResponse.fromEntity(promotion);
    }

    @Override
    @Transactional
    public PromotionResponse updatePromotion(UUID id, PromotionRequest request) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new PromotionNotFoundException("Promotion not found: " + id));

        promotion.setCode(request.getCode().toUpperCase());
        promotion.setName(request.getName());
        promotion.setDescription(request.getDescription());
        promotion.setType(request.getType());
        promotion.setDiscountValue(request.getDiscountValue());
        promotion.setMaxDiscount(request.getMaxDiscount());
        promotion.setMinOrderValue(request.getMinOrderValue());
        promotion.setUsageLimit(request.getUsageLimit());
        promotion.setUsagePerCustomer(request.getUsagePerCustomer());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setApplicableChannels(request.getApplicableChannels());
        promotion.setApplicableProducts(request.getApplicableProducts());
        promotion.setApplicableCategories(request.getApplicableCategories());
        promotion.setStatus(request.getStatus());

        promotion = promotionRepository.save(promotion);
        publishPromotionEvent(promotion, "PROMOTION_UPDATED");
        return PromotionResponse.fromEntity(promotion);
    }

    @Override
    public PromotionResponse getPromotion(UUID id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new PromotionNotFoundException("Promotion not found: " + id));
        return PromotionResponse.fromEntity(promotion);
    }

    @Override
    public PromotionResponse getPromotionByCode(String code) {
        Promotion promotion = promotionRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new PromotionNotFoundException("Promotion not found: " + code));
        return PromotionResponse.fromEntity(promotion);
    }

    @Override
    public Page<PromotionResponse> getAllPromotions(Pageable pageable) {
        return promotionRepository.findAll(pageable).map(PromotionResponse::fromEntity);
    }

    @Override
    @Transactional
    public void deletePromotion(UUID id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new PromotionNotFoundException("Promotion not found: " + id));
        promotionRepository.delete(promotion);
        publishPromotionEvent(promotion, "PROMOTION_DELETED");
    }

    @Override
    @Transactional
    public PromotionResponse activatePromotion(UUID id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new PromotionNotFoundException("Promotion not found: " + id));
        promotion.setStatus(Promotion.PromotionStatus.ACTIVE);
        promotion = promotionRepository.save(promotion);
        publishPromotionEvent(promotion, "PROMOTION_ACTIVATED");
        return PromotionResponse.fromEntity(promotion);
    }

    @Override
    @Transactional
    public PromotionResponse disablePromotion(UUID id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new PromotionNotFoundException("Promotion not found: " + id));
        promotion.setStatus(Promotion.PromotionStatus.DISABLED);
        promotion = promotionRepository.save(promotion);
        publishPromotionEvent(promotion, "PROMOTION_DISABLED");
        return PromotionResponse.fromEntity(promotion);
    }

    @Override
    @Transactional
    public ValidateCouponResponse validateCoupon(ValidateCouponRequest request) {
        Coupon coupon = couponRepository.findByCode(request.getCouponCode())
                .orElseThrow(() -> new InvalidCouponException("Coupon code not found"));

        if (coupon.getStatus() != Coupon.CouponStatus.AVAILABLE) {
            return ValidateCouponResponse.builder()
                    .valid(false)
                    .discountAmount(BigDecimal.ZERO)
                    .message("Coupon is not available")
                    .build();
        }

        Promotion promotion = promotionRepository.findById(coupon.getPromotionId())
                .orElseThrow(() -> new PromotionNotFoundException("Associated promotion not found"));

        try {
            validationService.validatePromotion(promotion, request.getOrderTotal(),
                    request.getChannel(), request.getProductId(), request.getCategoryId());
        } catch (InvalidCouponException e) {
            return ValidateCouponResponse.builder()
                    .valid(false)
                    .discountAmount(BigDecimal.ZERO)
                    .message(e.getMessage())
                    .build();
        }

        BigDecimal discount = validationService.calculateDiscount(promotion, request.getOrderTotal());

        return ValidateCouponResponse.builder()
                .valid(true)
                .discountAmount(discount)
                .promotionName(promotion.getName())
                .message("Coupon is valid")
                .build();
    }

    private void publishPromotionEvent(Promotion promotion, String eventType) {
        PromotionEvent event = PromotionEvent.builder()
                .eventType(eventType)
                .promotionId(promotion.getId())
                .code(promotion.getCode())
                .name(promotion.getName())
                .status(promotion.getStatus().name())
                .timestamp(LocalDateTime.now())
                .build();
        kafkaTemplate.send("promotion-events", promotion.getId().toString(), event);
    }

    public void publishPromotionApplied(Promotion promotion, Coupon coupon, BigDecimal discount) {
        PromotionAppliedEvent event = PromotionAppliedEvent.builder()
                .promotionId(promotion.getId())
                .promotionCode(promotion.getCode())
                .couponId(coupon.getId())
                .couponCode(coupon.getCode())
                .customerId(coupon.getCustomerId())
                .discountAmount(discount)
                .appliedAt(LocalDateTime.now())
                .build();
        kafkaTemplate.send("promotion-applied", coupon.getCode(), event);
    }
}
