package com.btlktpm.shipping.model;

import com.btlktpm.shipping.model.enums.Carrier;
import com.btlktpm.shipping.model.enums.ShipmentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "shipments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(name = "order_code", nullable = false)
    private String orderCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Carrier carrier;

    @Column(name = "tracking_code", unique = true)
    private String trackingCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus status;

    @Column(name = "sender_name")
    private String senderName;

    @Column(name = "sender_phone")
    private String senderPhone;

    @Column(name = "sender_address")
    private String senderAddress;

    @Column(name = "receiver_name", nullable = false)
    private String receiverName;

    @Column(name = "receiver_phone", nullable = false)
    private String receiverPhone;

    @Column(name = "receiver_address", nullable = false)
    private String receiverAddress;

    @Column(name = "from_city")
    private String fromCity;

    @Column(name = "from_district")
    private String fromDistrict;

    @Column(name = "to_city", nullable = false)
    private String toCity;

    @Column(name = "to_district", nullable = false)
    private String toDistrict;

    @Column(nullable = false)
    private BigDecimal weight;

    @Column(nullable = false)
    private BigDecimal cod;

    @Column(name = "shipping_fee")
    private BigDecimal shippingFee;

    @Column(name = "estimated_delivery")
    private LocalDateTime estimatedDelivery;

    @Column(name = "actual_delivery")
    private LocalDateTime actualDelivery;

    @Column(columnDefinition = "TEXT")
    private String note;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "carrier_data", columnDefinition = "jsonb")
    private String carrierData;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
