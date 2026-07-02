package com.btlktpm.shipping.model;

import com.btlktpm.shipping.model.enums.Carrier;
import com.btlktpm.shipping.model.enums.CarrierStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "carrier_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarrierConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private Carrier carrier;

    @Column(name = "api_key")
    private String apiKey;

    @Column(name = "api_secret")
    private String apiSecret;

    @Column(name = "endpoint_url", nullable = false)
    private String endpointUrl;

    @Column(name = "callback_url")
    private String callbackUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CarrierStatus status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "config_data", columnDefinition = "jsonb")
    private String configData;

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
