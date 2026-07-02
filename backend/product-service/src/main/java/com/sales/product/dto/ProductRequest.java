package com.sales.product.dto;

import com.sales.product.model.ProductStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequest {

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Slug is required")
    private String slug;

    private String description;

    @NotNull(message = "Category ID is required")
    private UUID categoryId;

    private UUID brandId;

    @NotNull(message = "Base price is required")
    @Min(value = 0, message = "Base price must be non-negative")
    private BigDecimal basePrice;

    @PositiveOrZero(message = "Sale price must be non-negative")
    private BigDecimal salePrice;

    private String unit;

    @PositiveOrZero(message = "Weight must be non-negative")
    private BigDecimal weight;

    private String images;

    private String tags;

    private ProductStatus status;

    private String channelSettings;
}
