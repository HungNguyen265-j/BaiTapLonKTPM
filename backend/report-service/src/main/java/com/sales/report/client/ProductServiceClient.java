package com.sales.report.client;

import com.sales.report.dto.ProductResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "product-service", path = "/api/products")
public interface ProductServiceClient {

    @GetMapping("/search")
    List<ProductResponse> searchProducts(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "channel", required = false) String channel);

    @GetMapping("/top")
    List<ProductResponse> getTopProducts(
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            @RequestParam(value = "channel", required = false) String channel);
}
