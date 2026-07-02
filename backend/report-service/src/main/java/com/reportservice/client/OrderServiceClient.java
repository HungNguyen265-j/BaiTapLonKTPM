package com.reportservice.client;

import com.reportservice.dto.OrderResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;

@FeignClient(name = "order-service", path = "/api/orders")
public interface OrderServiceClient {

    @GetMapping("/search")
    List<OrderResponse> searchOrders(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "channel", required = false) String channel);
}
