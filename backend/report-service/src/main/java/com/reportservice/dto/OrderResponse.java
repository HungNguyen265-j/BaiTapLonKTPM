package com.reportservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Khớp với OrderResponse thật của order-service
 * (trước đây khai báo netAmount/channel/orderDate — các trường không tồn tại).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private String id;
    private String orderCode;
    private String source;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private LocalDateTime createdAt;
    private String customerId;
    private String customerName;
    private String paymentMethod;
    // order-service không trả trường này (luôn null) — giữ lại cho RevenueReportService compile
    private Integer itemCount;
}
