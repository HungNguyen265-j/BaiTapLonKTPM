package com.reportservice.client;

import com.reportservice.dto.PageResponse;
import com.reportservice.dto.ProductResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "product-service", path = "/api/products")
public interface ProductServiceClient {

    // product-service không có endpoint /top — dùng /search phân trang
    @GetMapping("/search")
    PageResponse<ProductResponse> searchProducts(
            @RequestParam("page") int page,
            @RequestParam("size") int size);
}
