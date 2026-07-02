package com.sales.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "inventory-service", path = "/api/inventory")
public interface InventoryClient {

    @GetMapping("/stock/{productId}")
    ResponseEntity<Map<String, Object>> checkStock(@PathVariable("productId") String productId,
                                                    @RequestParam("quantity") Integer quantity);

    @PostMapping("/reserve")
    ResponseEntity<Map<String, Object>> reserveStock(@RequestBody Map<String, Object> request);

    @PostMapping("/release")
    ResponseEntity<Map<String, Object>> releaseStock(@RequestBody Map<String, Object> request);
}
