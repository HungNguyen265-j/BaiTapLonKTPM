package com.sales.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "customer-service", path = "/api/customers")
public interface CustomerClient {

    @GetMapping("/{id}")
    ResponseEntity<Map<String, Object>> getCustomer(@PathVariable("id") String id);

    @PutMapping("/{id}")
    ResponseEntity<Map<String, Object>> updateCustomer(@PathVariable("id") String id,
                                                       @RequestBody Map<String, Object> request);
}
