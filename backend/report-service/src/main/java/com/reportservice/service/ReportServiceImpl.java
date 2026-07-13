package com.reportservice.service;

import com.reportservice.client.CustomerServiceClient;
import com.reportservice.client.OrderServiceClient;
import com.reportservice.client.ProductServiceClient;
import com.reportservice.dto.CustomerResponse;
import com.reportservice.dto.DashboardResponse;
import com.reportservice.dto.OrderResponse;
import com.reportservice.dto.ProductResponse;
import com.reportservice.dto.RevenueReportResponse;
import com.reportservice.model.RevenueReport;
import com.reportservice.model.TopProduct;
import com.reportservice.repository.RevenueReportRepository;
import com.reportservice.repository.TopProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportServiceImpl implements ReportService {

    private final OrderServiceClient orderServiceClient;
    private final ProductServiceClient productServiceClient;
    private final CustomerServiceClient customerServiceClient;
    private final RevenueReportRepository revenueReportRepository;
    private final TopProductRepository topProductRepository;

    @Override
    public DashboardResponse getDashboardData(LocalDate startDate, LocalDate endDate) {
        List<OrderResponse> orders = fetchOrders(startDate, endDate);
        List<ProductResponse> topProducts = fetchTopProducts();
        List<CustomerResponse> customers = fetchCustomers(startDate, endDate);

        BigDecimal totalRevenue = orders.stream()
                .map(OrderResponse::getNetAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalOrders = orders.size();
        int totalCustomers = (int) customers.stream()
                .map(CustomerResponse::getId)
                .distinct()
                .count();

        Map<String, BigDecimal> revenueByChannel = orders.stream()
                .filter(o -> o.getNetAmount() != null)
                .collect(Collectors.groupingBy(
                        o -> o.getChannel() != null ? o.getChannel() : "UNKNOWN",
                        Collectors.mapping(OrderResponse::getNetAmount,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        Map<String, BigDecimal> revenueByDay = orders.stream()
                .filter(o -> o.getNetAmount() != null && o.getOrderDate() != null)
                .collect(Collectors.groupingBy(
                        o -> o.getOrderDate().toString(),
                        Collectors.mapping(OrderResponse::getNetAmount,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        Map<String, BigDecimal> revenueByDaySorted = new LinkedHashMap<>();
        revenueByDay.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(e -> revenueByDaySorted.put(e.getKey(), e.getValue()));

        return DashboardResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalCustomers(totalCustomers)
                .revenueByChannel(revenueByChannel)
                .revenueByDay(revenueByDaySorted)
                .topProducts(topProducts)
                .build();
    }

    @Override
    public List<RevenueReportResponse> getRevenueReport(LocalDate startDate, LocalDate endDate, String channel) {
        List<RevenueReport> reports;
        if (channel != null && !channel.isBlank()) {
            RevenueReport.Channel channelEnum = RevenueReport.Channel.valueOf(channel.toUpperCase());
            reports = revenueReportRepository.findByChannelAndReportDateBetween(channelEnum, startDate, endDate);
        } else {
            reports = revenueReportRepository.findByReportDateBetween(startDate, endDate);
        }
        return reports.stream()
                .map(this::toRevenueReportResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RevenueReportResponse> getTopProductsReport(LocalDate startDate, LocalDate endDate) {
        List<TopProduct> topProducts = topProductRepository
                .findByReportDateBetweenOrderByQuantitySoldDesc(startDate, endDate);
        return topProducts.stream()
                .map(tp -> RevenueReportResponse.builder()
                        .id(tp.getId())
                        .reportDate(tp.getReportDate())
                        .channel(tp.getChannel().name())
                        .revenue(tp.getRevenue())
                        .orderCount(tp.getQuantitySold())
                        .build())
                .collect(Collectors.toList());
    }

    private List<OrderResponse> fetchOrders(LocalDate startDate, LocalDate endDate) {
        try {
            return orderServiceClient.searchOrders(startDate, endDate, null, null);
        } catch (Exception e) {
            log.warn("Failed to fetch orders from order-service: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private List<ProductResponse> fetchTopProducts() {
        try {
            return productServiceClient.getTopProducts(10, null);
        } catch (Exception e) {
            log.warn("Failed to fetch top products from product-service: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private List<CustomerResponse> fetchCustomers(LocalDate startDate, LocalDate endDate) {
        try {
            return customerServiceClient.searchCustomers(startDate, endDate);
        } catch (Exception e) {
            log.warn("Failed to fetch customers from customer-service: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private RevenueReportResponse toRevenueReportResponse(RevenueReport report) {
        return RevenueReportResponse.builder()
                .id(report.getId())
                .reportDate(report.getReportDate())
                .channel(report.getChannel().name())
                .revenue(report.getRevenue())
                .orderCount(report.getOrderCount())
                .productCount(report.getProductCount())
                .averageOrderValue(report.getAverageOrderValue())
                .build();
    }
}
