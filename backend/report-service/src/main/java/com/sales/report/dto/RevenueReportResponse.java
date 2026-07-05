package com.sales.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueReportResponse {
    private UUID id;
    private LocalDate reportDate;
    private String channel;
    private BigDecimal revenue;
    private Integer orderCount;
    private Integer productCount;
    private BigDecimal averageOrderValue;
}
