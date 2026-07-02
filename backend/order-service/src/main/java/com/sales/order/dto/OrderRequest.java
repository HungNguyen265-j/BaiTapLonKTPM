package com.sales.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequest {

    @NotNull
    private String customerId;

    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String customerAddress;

    @NotBlank
    private String source;

    @NotEmpty
    @Valid
    private List<OrderItemRequest> items;

    private String notes;
    private String paymentMethod;
    private String shippingAddress;
}
