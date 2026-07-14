package com.reportservice.client;

import com.reportservice.dto.CustomerResponse;
import com.reportservice.dto.PageResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "customer-service", path = "/api/customers")
public interface CustomerServiceClient {

    @GetMapping("/search")
    PageResponse<CustomerResponse> searchCustomers(
            @RequestParam("page") int page,
            @RequestParam("size") int size);
}
