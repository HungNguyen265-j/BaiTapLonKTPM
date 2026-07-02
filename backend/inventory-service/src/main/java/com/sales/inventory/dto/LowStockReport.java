package com.sales.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LowStockReport {

    private UUID productId;
    private String sku;
    private String productName;
    private String warehouseName;
    private Integer currentStock;
    private Integer reorderPoint;
}
