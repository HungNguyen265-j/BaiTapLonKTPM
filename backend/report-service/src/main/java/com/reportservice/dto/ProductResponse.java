package com.reportservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private String id;
    private String productName;
    private String sku;
    private String channel;
    private BigDecimal price;
    private Integer quantitySold;
    private BigDecimal revenue;
    private String category;
}
