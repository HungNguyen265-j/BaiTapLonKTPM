package com.sales.report.service;

import com.sales.report.client.ProductServiceClient;
import com.sales.report.dto.ProductResponse;
import com.sales.report.model.RevenueReport;
import com.sales.report.model.TopProduct;
import com.sales.report.repository.TopProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TopProductService {

    private final ProductServiceClient productServiceClient;
    private final TopProductRepository topProductRepository;

    public List<TopProduct> generateTopProductsReport(LocalDate startDate, LocalDate endDate, int limit) {
        LocalDate today = LocalDate.now();
        try {
            List<ProductResponse> products = productServiceClient.getTopProducts(limit, null);
            List<TopProduct> topProducts = products.stream()
                    .map(p -> TopProduct.builder()
                            .productId(p.getId())
                            .productName(p.getProductName())
                            .sku(p.getSku())
                            .channel(mapChannel(p.getChannel()))
                            .quantitySold(p.getQuantitySold() != null ? p.getQuantitySold() : 0)
                            .revenue(p.getRevenue() != null ? p.getRevenue() : BigDecimal.ZERO)
                            .reportDate(today)
                            .build())
                    .collect(Collectors.toList());

            topProductRepository.saveAll(topProducts);
            log.info("Top products report generated with {} products", topProducts.size());
            return topProducts;
        } catch (Exception e) {
            log.warn("Failed to generate top products report: {}", e.getMessage());
            return List.of();
        }
    }

    private RevenueReport.Channel mapChannel(String channel) {
        if (channel == null) return RevenueReport.Channel.TOTAL;
        try {
            return RevenueReport.Channel.valueOf(channel.toUpperCase());
        } catch (IllegalArgumentException e) {
            return RevenueReport.Channel.TOTAL;
        }
    }
}
