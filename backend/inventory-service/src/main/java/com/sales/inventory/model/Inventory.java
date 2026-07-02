package com.sales.inventory.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "inventories",
       uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "warehouse_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(nullable = false)
    private String sku;

    @Column(name = "warehouse_id", nullable = false)
    private UUID warehouseId;

    @Column(name = "quantity_on_hand", nullable = false)
    private Integer quantityOnHand;

    @Column(name = "quantity_reserved", nullable = false)
    private Integer quantityReserved;

    @Column(name = "quantity_available", nullable = false)
    private Integer quantityAvailable;

    @Column(name = "reorder_point")
    private Integer reorderPoint;

    @Column(name = "reorder_quantity")
    private Integer reorderQuantity;

    @Column(name = "location_bin")
    private String locationBin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InventoryStatus status;

    @Version
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (quantityOnHand == null) quantityOnHand = 0;
        if (quantityReserved == null) quantityReserved = 0;
        if (quantityAvailable == null) quantityAvailable = quantityOnHand - quantityReserved;
        if (status == null) status = InventoryStatus.ACTIVE;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        quantityAvailable = quantityOnHand - quantityReserved;
    }

    public enum InventoryStatus {
        ACTIVE, DISCONTINUED, OUT_OF_STOCK
    }
}
