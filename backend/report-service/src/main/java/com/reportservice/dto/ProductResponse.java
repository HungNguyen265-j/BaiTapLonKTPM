package com.reportservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** Khớp với ProductResponse thật của product-service. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private String id;
    private String sku;
    private String name;
    private String unit;
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private String status;
}
