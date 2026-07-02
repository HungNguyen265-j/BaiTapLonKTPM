package com.reportservice.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reportservice.model.DailySummary;
import com.reportservice.service.RevenueReportService;
import com.reportservice.service.TopProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReportEventHandler {

    private final RevenueReportService revenueReportService;
    private final TopProductService topProductService;
    private final MongoTemplate mongoTemplate;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "order-events", groupId = "report-service-group")
    public void handleOrderEvent(String message) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> event = objectMapper.readValue(message, Map.class);
            String eventType = (String) event.get("eventType");

            if ("ORDER_CREATED".equals(eventType) || "ORDER_UPDATED".equals(eventType)) {
                LocalDate today = LocalDate.now();
                LocalDate weekAgo = today.minusDays(7);

                revenueReportService.generateRevenueReport(weekAgo, today);
                topProductService.generateTopProductsReport(weekAgo, today, 10);

                updateDailySummary(today);
                log.info("Reports updated after event: {}", eventType);
            }
        } catch (Exception e) {
            log.error("Failed to handle order event: {}", e.getMessage(), e);
        }
    }

    private void updateDailySummary(LocalDate date) {
        try {
            DailySummary summary = DailySummary.builder()
                    .date(date)
                    .channel("TOTAL")
                    .totalRevenue(BigDecimal.ZERO)
                    .totalOrders(0)
                    .totalCustomers(0)
                    .totalProducts(0)
                    .build();
            mongoTemplate.save(summary, "daily_summaries");
        } catch (Exception e) {
            log.error("Failed to update daily summary: {}", e.getMessage());
        }
    }
}
