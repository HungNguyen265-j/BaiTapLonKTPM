package com.sales.product.dto;

import com.sales.product.model.ProductStatus;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSearchCriteria {

    private String keyword;
    private UUID categoryId;
    private UUID brandId;
    private ProductStatus status;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    @Builder.Default
    private int page = 0;

    @Builder.Default
    private int size = 20;

    @Builder.Default
    private String sortBy = "createdAt";

    @Builder.Default
    private String sortDir = "desc";
}
