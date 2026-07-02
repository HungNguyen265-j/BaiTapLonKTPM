package com.sales.order.dto;

import com.sales.order.model.Order.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private UUID id;
    private String orderCode;
    private String customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String customerAddress;
    private String source;
    private String channelOrderId;
    private String status;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal shippingFee;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private String notes;
    private String tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemResponse> items;
    private List<OrderHistoryResponse> histories;
    private List<PaymentResponse> payments;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemResponse {
        private UUID id;
        private String productId;
        private String sku;
        private String productName;
        private String imageUrl;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal discountAmount;
        private BigDecimal totalPrice;
        private String attributes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderHistoryResponse {
        private UUID id;
        private String fromStatus;
        private String toStatus;
        private String changedBy;
        private String note;
        private LocalDateTime createdAt;
    }
}
