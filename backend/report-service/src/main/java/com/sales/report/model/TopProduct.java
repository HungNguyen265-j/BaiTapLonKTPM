package com.sales.report.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "top_products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "product_id", nullable = false, length = 50)
    private String productId;

    @Column(name = "product_name", nullable = false, length = 255)
    private String productName;

    @Column(name = "sku", length = 100)
    private String sku;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false, length = 20)
    private RevenueReport.Channel channel;

    @Column(name = "quantity_sold", nullable = false)
    private Integer quantitySold;

    @Column(name = "revenue", nullable = false, precision = 15, scale = 2)
    private BigDecimal revenue;

    @Column(name = "report_date", nullable = false)
    private LocalDate reportDate;
}
