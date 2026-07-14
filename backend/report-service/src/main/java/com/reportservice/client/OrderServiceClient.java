package com.reportservice.client;

import com.reportservice.dto.OrderResponse;
import com.reportservice.dto.PageResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "order-service", path = "/api/orders")
public interface OrderServiceClient {

    // order-service nhận startDate/endDate dạng chuỗi ISO (yyyy-MM-dd)
    // và trả về PageResponse chứ không phải danh sách phẳng
    @GetMapping("/search")
    PageResponse<OrderResponse> searchOrders(
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate,
            @RequestParam("page") int page,
            @RequestParam("size") int size);
}
