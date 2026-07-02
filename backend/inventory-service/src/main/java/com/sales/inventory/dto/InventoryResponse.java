package com.sales.inventory.dto;

import com.sales.inventory.model.Inventory;
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
public class InventoryResponse {

    private UUID id;
    private UUID productId;
    private String sku;
    private UUID warehouseId;
    private Integer quantityOnHand;
    private Integer quantityReserved;
    private Integer quantityAvailable;
    private Integer reorderPoint;
    private Integer reorderQuantity;
    private String locationBin;
    private String status;
    private Long version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static InventoryResponse fromEntity(Inventory inventory) {
        return InventoryResponse.builder()
                .id(inventory.getId())
                .productId(inventory.getProductId())
                .sku(inventory.getSku())
                .warehouseId(inventory.getWarehouseId())
                .quantityOnHand(inventory.getQuantityOnHand())
                .quantityReserved(inventory.getQuantityReserved())
                .quantityAvailable(inventory.getQuantityOnHand() - inventory.getQuantityReserved())
                .reorderPoint(inventory.getReorderPoint())
                .reorderQuantity(inventory.getReorderQuantity())
                .locationBin(inventory.getLocationBin())
                .status(inventory.getStatus().name())
                .version(inventory.getVersion())
                .createdAt(inventory.getCreatedAt())
                .updatedAt(inventory.getUpdatedAt())
                .build();
    }
}
