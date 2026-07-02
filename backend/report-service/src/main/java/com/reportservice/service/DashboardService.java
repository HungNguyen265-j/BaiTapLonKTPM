package com.reportservice.service;

import com.reportservice.client.CustomerServiceClient;
import com.reportservice.client.OrderServiceClient;
import com.reportservice.client.ProductServiceClient;
import com.reportservice.dto.CustomerResponse;
import com.reportservice.dto.DashboardResponse;
import com.reportservice.dto.OrderResponse;
import com.reportservice.dto.ProductResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final OrderServiceClient orderServiceClient;
    private final ProductServiceClient productServiceClient;
    private final CustomerServiceClient customerServiceClient;

    public DashboardResponse getSummary(LocalDate startDate, LocalDate endDate) {
        List<OrderResponse> orders = fetchOrders(startDate, endDate);
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

        return DashboardResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalCustomers(totalCustomers)
                .build();
    }

    public Map<String, BigDecimal> getRevenueByChannel(LocalDate startDate, LocalDate endDate) {
        List<OrderResponse> orders = fetchOrders(startDate, endDate);
        Map<String, BigDecimal> revenueByChannel = orders.stream()
                .filter(o -> o.getNetAmount() != null)
                .collect(Collectors.groupingBy(
                        o -> o.getChannel() != null ? o.getChannel() : "UNKNOWN",
                        Collectors.mapping(OrderResponse::getNetAmount,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));
        return revenueByChannel.entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                .collect(Collectors.toMap(
                        Map.Entry::getKey, Map.Entry::getValue,
                        (a, b) -> a, LinkedHashMap::new));
    }

    public Map<String, BigDecimal> getRevenueByDay(LocalDate startDate, LocalDate endDate) {
        List<OrderResponse> orders = fetchOrders(startDate, endDate);
        Map<String, BigDecimal> revenueByDay = orders.stream()
                .filter(o -> o.getNetAmount() != null && o.getOrderDate() != null)
                .collect(Collectors.groupingBy(
                        o -> o.getOrderDate().toString(),
                        Collectors.mapping(OrderResponse::getNetAmount,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        Map<String, BigDecimal> sorted = new LinkedHashMap<>();
        revenueByDay.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(e -> sorted.put(e.getKey(), e.getValue()));
        return sorted;
    }

    private List<OrderResponse> fetchOrders(LocalDate startDate, LocalDate endDate) {
        try {
            return orderServiceClient.searchOrders(startDate, endDate, null, null);
        } catch (Exception e) {
            log.warn("Failed to fetch orders: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private List<CustomerResponse> fetchCustomers(LocalDate startDate, LocalDate endDate) {
        try {
            return customerServiceClient.searchCustomers(startDate, endDate);
        } catch (Exception e) {
            log.warn("Failed to fetch customers: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
