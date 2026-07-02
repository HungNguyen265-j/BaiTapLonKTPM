package com.sales.order.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PaymentProcessedEvent extends OrderEvent {

    private String paymentMethod;
    private String transactionId;
    private BigDecimal amount;
}
