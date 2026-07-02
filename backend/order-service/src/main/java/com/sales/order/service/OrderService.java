package com.sales.order.service;

import com.sales.order.dto.OrderRequest;
import com.sales.order.dto.OrderResponse;
import com.sales.order.dto.OrderSearchCriteria;
import com.sales.order.dto.OrderStatusUpdateRequest;
import com.sales.order.dto.PageResponse;

import java.util.List;
import java.util.UUID;

public interface OrderService {

    OrderResponse createOrder(OrderRequest request);

    OrderResponse getOrder(UUID id);

    OrderResponse getOrderByCode(String orderCode);

    PageResponse<OrderResponse> searchOrders(OrderSearchCriteria criteria);

    OrderResponse updateStatus(UUID id, OrderStatusUpdateRequest request);

    OrderResponse cancelOrder(UUID id);

    List<OrderResponse.OrderHistoryResponse> getOrderHistory(UUID id);

    OrderResponse processWebhook(String source, Object webhookPayload);
}
