package com.sales.report.service;

import com.sales.report.client.OrderServiceClient;
import com.sales.report.dto.OrderResponse;
import com.sales.report.model.RevenueReport;
import com.sales.report.repository.RevenueReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RevenueReportService {

    private final OrderServiceClient orderServiceClient;
    private final RevenueReportRepository revenueReportRepository;

    public List<RevenueReport> generateRevenueReport(LocalDate startDate, LocalDate endDate) {
        List<OrderResponse> orders = fetchOrdersWithFallback(startDate, endDate);
        Map<String, List<OrderResponse>> byChannel = orders.stream()
                .filter(o -> o.getChannel() != null)
                .collect(Collectors.groupingBy(OrderResponse::getChannel));

        byChannel.forEach((channel, channelOrders) -> saveReportForChannel(channel, channelOrders, startDate, endDate));

        List<OrderResponse> allOrders = byChannel.values().stream()
                .flatMap(List::stream)
                .collect(Collectors.toList());
        saveReportForChannel("TOTAL", allOrders, startDate, endDate);

        log.info("Revenue report generated for period {} to {}", startDate, endDate);
        return revenueReportRepository.findByReportDateBetween(startDate, endDate);
    }

    private void saveReportForChannel(String channelName, List<OrderResponse> orders, LocalDate startDate, LocalDate endDate) {
        try {
            RevenueReport.Channel channel = RevenueReport.Channel.valueOf(channelName.toUpperCase());
            BigDecimal revenue = orders.stream()
                    .map(OrderResponse::getNetAmount)
                    .filter(java.util.Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            int orderCount = orders.size();
            int productCount = orders.stream()
                    .filter(o -> o.getItemCount() != null)
                    .mapToInt(OrderResponse::getItemCount)
                    .sum();
            BigDecimal avgOrderValue = orderCount > 0
                    ? revenue.divide(BigDecimal.valueOf(orderCount), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
                LocalDate finalDate = date;
                List<OrderResponse> dailyOrders = orders.stream()
                        .filter(o -> o.getOrderDate() != null && o.getOrderDate().equals(finalDate))
                        .collect(Collectors.toList());

                BigDecimal dailyRevenue = dailyOrders.stream()
                        .map(OrderResponse::getNetAmount)
                        .filter(java.util.Objects::nonNull)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                int dailyOrderCount = dailyOrders.size();
                int dailyProductCount = dailyOrders.stream()
                        .filter(o -> o.getItemCount() != null)
                        .mapToInt(OrderResponse::getItemCount)
                        .sum();
                BigDecimal dailyAvg = dailyOrderCount > 0
                        ? dailyRevenue.divide(BigDecimal.valueOf(dailyOrderCount), 2, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO;

                RevenueReport report = RevenueReport.builder()
                        .reportDate(finalDate)
                        .channel(channel)
                        .revenue(dailyRevenue)
                        .orderCount(dailyOrderCount)
                        .productCount(dailyProductCount)
                        .averageOrderValue(dailyAvg)
                        .build();

                revenueReportRepository.save(report);
            }
        } catch (IllegalArgumentException e) {
            log.warn("Unknown channel: {}, skipping", channelName);
        }
    }

    private List<OrderResponse> fetchOrdersWithFallback(LocalDate startDate, LocalDate endDate) {
        try {
            return orderServiceClient.searchOrders(startDate, endDate, null, null);
        } catch (Exception e) {
            log.warn("Failed to fetch orders for revenue report: {}", e.getMessage());
            return List.of();
        }
    }
}
