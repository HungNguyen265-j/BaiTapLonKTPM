package com.sales.product.dto;

import com.sales.product.model.ProductStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private UUID id;
    private String sku;
    private String name;
    private String slug;
    private String description;
    private UUID categoryId;
    private UUID brandId;
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private String unit;
    private BigDecimal weight;
    private String images;
    private String tags;
    private ProductStatus status;
    private String channelSettings;
    private String createdBy;
    private String updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer version;
}
