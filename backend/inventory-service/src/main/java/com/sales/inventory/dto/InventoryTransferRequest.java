package com.sales.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryTransferRequest {

    @NotNull(message = "From warehouse ID is required")
    private UUID fromWarehouseId;

    @NotNull(message = "To warehouse ID is required")
    private UUID toWarehouseId;

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be positive")
    private Integer quantity;

    private String note;
}
