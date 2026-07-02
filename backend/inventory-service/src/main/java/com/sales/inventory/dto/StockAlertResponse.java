package com.sales.inventory.dto;

import com.sales.inventory.model.StockAlert;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAlertResponse {

    private UUID id;
    private UUID productId;
    private String sku;
    private UUID warehouseId;
    private String alertType;
    private Integer threshold;
    private Integer currentQuantity;
    private String status;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;

    public static StockAlertResponse fromEntity(StockAlert alert) {
        return StockAlertResponse.builder()
                .id(alert.getId())
                .productId(alert.getProductId())
                .sku(alert.getSku())
                .warehouseId(alert.getWarehouseId())
                .alertType(alert.getAlertType().name())
                .threshold(alert.getThreshold())
                .currentQuantity(alert.getCurrentQuantity())
                .status(alert.getStatus().name())
                .resolvedAt(alert.getResolvedAt())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}
