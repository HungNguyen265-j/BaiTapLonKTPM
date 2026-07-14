package com.reportservice.service;

import com.reportservice.client.ProductServiceClient;
import com.reportservice.dto.ProductResponse;
import com.reportservice.model.RevenueReport;
import com.reportservice.model.TopProduct;
import com.reportservice.repository.TopProductRepository;
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
            // product-service không có số liệu bán theo sản phẩm — lấy danh sách sản phẩm,
            // số lượng/doanh thu để 0 (bảng top_products chỉ dùng cho hướng mở rộng event-driven)
            List<ProductResponse> products = productServiceClient.searchProducts(0, limit).getContent();
            if (products == null) products = List.of();
            List<TopProduct> topProducts = products.stream()
                    .map(p -> TopProduct.builder()
                            .productId(p.getId())
                            .productName(p.getName())
                            .sku(p.getSku())
                            .channel(mapChannel(null))
                            .quantitySold(0)
                            .revenue(BigDecimal.ZERO)
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
