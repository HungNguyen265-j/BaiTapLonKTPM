package com.sales.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "product-service", path = "/api/products")
public interface ProductClient {

    @GetMapping("/{id}")
    ResponseEntity<Map<String, Object>> getProduct(@PathVariable("id") String id);

    @GetMapping("/{id}/price")
    ResponseEntity<Map<String, Object>> getProductPrice(@PathVariable("id") String id,
                                                        @RequestParam("sku") String sku);
}
