package com.sales.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private UUID id;
    private String orderId;
    private String paymentMethod;
    private String transactionId;
    private BigDecimal amount;
    private String status;
    private LocalDateTime paidAt;
    private String gatewayResponse;
    private LocalDateTime createdAt;
}
