package com.reportservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private BigDecimal totalRevenue;
    private Integer totalOrders;
    private Integer totalCustomers;
    private Map<String, BigDecimal> revenueByChannel;
    private Map<String, BigDecimal> revenueByDay;
    private List<ProductResponse> topProducts;
}
