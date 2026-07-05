package com.sales.order.service;

import com.sales.order.dto.*;
import com.sales.order.event.OrderCreatedEvent;
import com.sales.order.event.OrderEvent;
import com.sales.order.event.OrderStatusChangedEvent;
import com.sales.order.exception.InvalidOrderStatusException;
import com.sales.order.exception.OrderNotFoundException;
import com.sales.order.model.Order;
import com.sales.order.model.Order.OrderSource;
import com.sales.order.model.Order.OrderStatus;
import com.sales.order.model.OrderHistory;
import com.sales.order.model.OrderItem;
import com.sales.order.model.PaymentInfo;
import com.sales.order.repository.OrderHistoryRepository;
import com.sales.order.repository.OrderItemRepository;
import com.sales.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.*;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = Map.of(
            OrderStatus.PENDING, Set.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
            OrderStatus.CONFIRMED, Set.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED),
            OrderStatus.PROCESSING, Set.of(OrderStatus.SHIPPING, OrderStatus.CANCELLED),
            OrderStatus.SHIPPING, Set.of(OrderStatus.DELIVERED),
            OrderStatus.DELIVERED, Set.of(OrderStatus.COMPLETED),
            OrderStatus.CANCELLED, Set.of(OrderStatus.REFUNDED),
            OrderStatus.COMPLETED, Collections.emptySet(),
            OrderStatus.REFUNDED, Collections.emptySet()
    );

    @Override
    @Transactional
    @CacheEvict(value = "orders", allEntries = true)
    public OrderResponse createOrder(OrderRequest request) {
        OrderSource source = parseSource(request.getSource());

        Order order = Order.builder()
                .customerId(UUID.fromString(request.getCustomerId()))
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .customerPhone(request.getCustomerPhone())
                .customerAddress(request.getCustomerAddress() != null ? request.getCustomerAddress() : request.getShippingAddress())
                .source(source)
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            BigDecimal unitPrice = itemReq.getUnitPrice();
            BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .productId(UUID.fromString(itemReq.getProductId()))
                    .sku(itemReq.getSku())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(totalPrice)
                    .build();

            items.add(item);
            subtotal = subtotal.add(totalPrice);
        }

        order.setSubtotal(subtotal);
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setShippingFee(BigDecimal.ZERO);
        order.setTaxAmount(BigDecimal.ZERO);
        order.setTotalAmount(subtotal);

        order = orderRepository.save(order);

        for (OrderItem item : items) {
            item.setOrder(order);
        }
        orderItemRepository.saveAll(items);
        order.setOrderItems(items);

        publishEvent(createOrderEvent(order, request));

        log.info("Order created: code={}, id={}", order.getOrderCode(), order.getId());
        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrder(UUID id) {
        Order order = findOrderById(id);
        return mapToResponse(order);
    }

    @Override
    public OrderResponse getOrderByCode(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new OrderNotFoundException("Order not found by code: " + orderCode));
        return mapToResponse(order);
    }

    @Override
    public PageResponse<OrderResponse> searchOrders(OrderSearchCriteria criteria) {
        Pageable pageable = PageRequest.of(
                criteria.getPage(),
                criteria.getSize(),
                Sort.by(Sort.Direction.fromString(criteria.getSortDir()), criteria.getSortBy())
        );

        LocalDateTime startDate = criteria.getStartDate() != null ?
                LocalDateTime.parse(criteria.getStartDate()) : null;
        LocalDateTime endDate = criteria.getEndDate() != null ?
                LocalDateTime.parse(criteria.getEndDate()) : null;
        String customerIdStr = criteria.getCustomerId() != null ?
                criteria.getCustomerId().toString() : null;

        List<Order> orders = orderRepository.searchOrders(
                criteria.getKeyword(),
                criteria.getStatus(),
                criteria.getSource(),
                customerIdStr,
                startDate,
                endDate
        );

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), orders.size());
        List<Order> paged = orders.subList(start, end);
        Page<Order> orderPage = new PageImpl<>(paged, pageable, orders.size());

        return PageResponse.from(orderPage.map(this::mapToResponse));
    }

    @Override
    @Transactional
    @CacheEvict(value = "orders", key = "#id")
    public OrderResponse updateStatus(UUID id, OrderStatusUpdateRequest request) {
        Order order = findOrderById(id);
        OrderStatus newStatus = parseStatus(request.getNewStatus());
        OrderStatus currentStatus = order.getStatus();

        if (!isValidTransition(currentStatus, newStatus)) {
            throw new InvalidOrderStatusException(
                    "Cannot transition from " + currentStatus + " to " + newStatus);
        }

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(newStatus);
        order = orderRepository.save(order);

        addHistory(order, oldStatus, newStatus, "SYSTEM", request.getNote());

        publishEvent(createStatusChangedEvent(order, oldStatus, newStatus));

        log.info("Order {} status changed: {} -> {}", order.getOrderCode(), oldStatus, newStatus);
        return mapToResponse(order);
    }

    @Override
    @Transactional
    @CacheEvict(value = "orders", key = "#id")
    public OrderResponse cancelOrder(UUID id) {
        Order order = findOrderById(id);

        if (order.getStatus() == OrderStatus.SHIPPING ||
                order.getStatus() == OrderStatus.DELIVERED ||
                order.getStatus() == OrderStatus.COMPLETED) {
            throw new InvalidOrderStatusException(
                    "Cannot cancel order in status: " + order.getStatus());
        }

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        addHistory(order, oldStatus, OrderStatus.CANCELLED, "SYSTEM", "Order cancelled");

        publishEvent(createStatusChangedEvent(order, oldStatus, OrderStatus.CANCELLED));

        log.info("Order cancelled: code={}", order.getOrderCode());
        return mapToResponse(order);
    }

    @Override
    public List<OrderResponse.OrderHistoryResponse> getOrderHistory(UUID id) {
        findOrderById(id);
        List<OrderHistory> histories = orderHistoryRepository.findByOrderIdOrderByCreatedAtDesc(id);
        return histories.stream().map(this::mapToHistoryResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponse processWebhook(String source, Object webhookPayload) {
        log.info("Processing webhook from source={}, payload={}", source, webhookPayload);
        return null;
    }

    private Order findOrderById(UUID id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order not found: " + id));
    }

    private OrderSource parseSource(String source) {
        try {
            return OrderSource.valueOf(source.toUpperCase());
        } catch (IllegalArgumentException e) {
            return OrderSource.API;
        }
    }

    private OrderStatus parseStatus(String status) {
        try {
            return OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidOrderStatusException("Invalid status: " + status);
        }
    }

    private boolean isValidTransition(OrderStatus from, OrderStatus to) {
        return VALID_TRANSITIONS.getOrDefault(from, Collections.emptySet()).contains(to);
    }

    private void addHistory(Order order, OrderStatus from, OrderStatus to, String changedBy, String note) {
        OrderHistory history = OrderHistory.builder()
                .order(order)
                .fromStatus(from)
                .toStatus(to)
                .changedBy(changedBy)
                .note(note)
                .build();
        orderHistoryRepository.save(history);
    }

    private void publishEvent(OrderEvent event) {
        try {
            kafkaTemplate.send("order-events", event);
        } catch (Exception e) {
            log.warn("Failed to publish event: {}", e.getMessage());
        }
    }

    private OrderCreatedEvent createOrderEvent(Order order, OrderRequest request) {
        OrderCreatedEvent event = new OrderCreatedEvent();
        event.setEventId(OrderEvent.generateEventId());
        event.setOrderId(order.getId().toString());
        event.setOrderCode(order.getOrderCode());
        event.setEventType("ORDER_CREATED");
        event.setTimestamp(order.getCreatedAt());
        event.setCustomerId(order.getCustomerId().toString());
        event.setTotal(order.getTotalAmount());
        List<Map<String, Object>> items = request.getItems().stream()
                .map(i -> Map.<String, Object>of(
                        "productId", i.getProductId(),
                        "sku", i.getSku(),
                        "quantity", i.getQuantity(),
                        "unitPrice", i.getUnitPrice()
                ))
                .collect(Collectors.toList());
        event.setItems(items);
        return event;
    }

    private OrderStatusChangedEvent createStatusChangedEvent(Order order, OrderStatus from, OrderStatus to) {
        OrderStatusChangedEvent event = new OrderStatusChangedEvent();
        event.setEventId(OrderEvent.generateEventId());
        event.setOrderId(order.getId().toString());
        event.setOrderCode(order.getOrderCode());
        event.setEventType("ORDER_STATUS_CHANGED");
        event.setTimestamp(LocalDateTime.now());
        event.setFromStatus(from.name());
        event.setToStatus(to.name());
        return event;
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderResponse.OrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(this::mapToItemResponse)
                .collect(Collectors.toList());

        List<OrderResponse.OrderHistoryResponse> historyResponses = order.getHistories().stream()
                .map(this::mapToHistoryResponse)
                .collect(Collectors.toList());

        List<PaymentResponse> paymentResponses = order.getPayments().stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .customerId(order.getCustomerId() != null ? order.getCustomerId().toString() : null)
                .customerName(order.getCustomerName())
                .customerEmail(order.getCustomerEmail())
                .customerPhone(order.getCustomerPhone())
                .customerAddress(order.getCustomerAddress())
                .source(order.getSource() != null ? order.getSource().name() : null)
                .channelOrderId(order.getChannelOrderId())
                .status(order.getStatus() != null ? order.getStatus().name() : null)
                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .shippingFee(order.getShippingFee())
                .taxAmount(order.getTaxAmount())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .notes(order.getNotes())
                .tags(order.getTags())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(itemResponses)
                .histories(historyResponses)
                .payments(paymentResponses)
                .build();
    }

    private PaymentResponse mapToPaymentResponse(PaymentInfo payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder() != null ? payment.getOrder().getId().toString() : null)
                .paymentMethod(payment.getPaymentMethod())
                .transactionId(payment.getTransactionId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .paidAt(payment.getPaidAt())
                .gatewayResponse(payment.getGatewayResponse())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    private OrderResponse.OrderItemResponse mapToItemResponse(OrderItem item) {
        return OrderResponse.OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProductId() != null ? item.getProductId().toString() : null)
                .sku(item.getSku())
                .productName(item.getProductName())
                .imageUrl(item.getImageUrl())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .discountAmount(item.getDiscountAmount())
                .totalPrice(item.getTotalPrice())
                .attributes(item.getAttributes())
                .build();
    }

    private OrderResponse.OrderHistoryResponse mapToHistoryResponse(OrderHistory history) {
        return OrderResponse.OrderHistoryResponse.builder()
                .id(history.getId())
                .fromStatus(history.getFromStatus() != null ? history.getFromStatus().name() : null)
                .toStatus(history.getToStatus() != null ? history.getToStatus().name() : null)
                .changedBy(history.getChangedBy())
                .note(history.getNote())
                .createdAt(history.getCreatedAt())
                .build();
    }
}
