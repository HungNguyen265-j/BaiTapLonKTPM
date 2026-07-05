package com.sales.report.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Document(collection = "daily_summaries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailySummary {

    @Id
    private String id;

    private LocalDate date;

    private String channel;

    private BigDecimal totalRevenue;

    private Integer totalOrders;

    private Integer totalCustomers;

    private Integer totalProducts;

    private List<TopProductEntry> topProducts;

    private Map<String, ChannelBreakdown> channelBreakdown;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopProductEntry {
        private String productId;
        private String productName;
        private Integer quantitySold;
        private BigDecimal revenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChannelBreakdown {
        private BigDecimal revenue;
        private Integer orderCount;
        private BigDecimal percentage;
    }
}
