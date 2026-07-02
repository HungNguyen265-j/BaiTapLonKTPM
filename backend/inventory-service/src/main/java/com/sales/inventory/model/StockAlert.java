package com.sales.inventory.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(nullable = false)
    private String sku;

    @Column(name = "warehouse_id", nullable = false)
    private UUID warehouseId;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false)
    private AlertType alertType;

    @Column(nullable = false)
    private Integer threshold;

    @Column(name = "current_quantity", nullable = false)
    private Integer currentQuantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertStatus status;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = AlertStatus.PENDING;
    }

    public enum AlertType {
        LOW_STOCK, OVERSTOCK, OUT_OF_STOCK
    }

    public enum AlertStatus {
        PENDING, RESOLVED, IGNORED
    }
}
