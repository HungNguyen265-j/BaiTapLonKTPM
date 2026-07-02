package com.sales.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "shipping-service", path = "/api/shipping")
public interface ShippingClient {

    @PostMapping("/shipments")
    ResponseEntity<Map<String, Object>> createShipment(@RequestBody Map<String, Object> request);

    @GetMapping("/fee")
    ResponseEntity<Map<String, Object>> getShippingFee(@RequestParam("address") String address,
                                                       @RequestParam("weight") Double weight);
}
