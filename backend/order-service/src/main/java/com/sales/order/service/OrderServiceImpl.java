package com.sales.order.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sales.order.dto.OrderItemRequest;
import com.sales.order.dto.OrderRequest;
import com.sales.order.dto.OrderResponse;
import com.sales.order.dto.OrderSearchCriteria;
import com.sales.order.dto.OrderStatusUpdateRequest;
import com.sales.order.dto.PageResponse;
import com.sales.order.dto.PaymentResponse;
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
import com.sales.order.repository.OrderRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private static final String ORDER_EVENTS_TOPIC = "order-events";
    private static final String ORDER_STATUS_CHANGED_TOPIC = "order-status-changed";
    private static final String SYSTEM_USER = "system";

    private static final Set<OrderStatus> TERMINAL_STATUSES =
            EnumSet.of(OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.REFUNDED);
    private static final Set<OrderStatus> NON_CANCELLABLE_STATUSES =
            EnumSet.of(OrderStatus.SHIPPING, OrderStatus.DELIVERED, OrderStatus.COMPLETED,
                    OrderStatus.CANCELLED, OrderStatus.REFUNDED);
    private static final Set<String> SORTABLE_FIELDS =
            Set.of("createdAt", "updatedAt", "totalAmount", "orderCode", "status");

    private final OrderRepository orderRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        UUID customerId = parseUuid(request.getCustomerId(), "customerId");
        OrderSource source = parseSource(request.getSource());

        Order order = Order.builder()
                .customerId(customerId)
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .customerPhone(request.getCustomerPhone())
                .customerAddress(request.getShippingAddress() != null
                        ? request.getShippingAddress() : request.getCustomerAddress())
                .source(source)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentInfo.PaymentStatus.PENDING.name())
                .notes(request.getNotes())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItemRequest itemRequest : request.getItems()) {
            BigDecimal lineTotal = itemRequest.getUnitPrice()
                    .multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            OrderItem item = OrderItem.builder()
                    .order(order)
                    .productId(parseUuid(itemRequest.getProductId(), "productId"))
                    .sku(itemRequest.getSku())
                    .productName(itemRequest.getProductName() != null && !itemRequest.getProductName().isBlank()
                            ? itemRequest.getProductName() : itemRequest.getSku())
                    .imageUrl(itemRequest.getImageUrl())
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(itemRequest.getUnitPrice())
                    .discountAmount(BigDecimal.ZERO)
                    .totalPrice(lineTotal)
                    .build();
            order.getOrderItems().add(item);
            subtotal = subtotal.add(lineTotal);
        }
        order.setSubtotal(subtotal);
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setShippingFee(BigDecimal.ZERO);
        order.setTaxAmount(BigDecimal.ZERO);
        order.setTotalAmount(subtotal);

        Order saved = orderRepository.save(order);
        saved.getHistories().add(recordHistory(saved, null, saved.getStatus(), "Tạo đơn hàng"));

        publishOrderCreated(saved);
        log.info("Đã tạo đơn hàng {} (nguồn {}, tổng tiền {})",
                saved.getOrderCode(), saved.getSource(), saved.getTotalAmount());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrder(UUID id) {
        return toResponse(findOrder(id));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByCode(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new OrderNotFoundException(
                        "Không tìm thấy đơn hàng với mã: " + orderCode));
        return toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> searchOrders(OrderSearchCriteria criteria) {
        Sort.Direction direction = "asc".equalsIgnoreCase(criteria.getSortDir())
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortBy = SORTABLE_FIELDS.contains(criteria.getSortBy())
                ? criteria.getSortBy() : "createdAt";
        Pageable pageable = PageRequest.of(
                Math.max(criteria.getPage(), 0),
                criteria.getSize() > 0 ? criteria.getSize() : 20,
                Sort.by(direction, sortBy));

        Page<Order> result = orderRepository.findAll(buildSpecification(criteria), pageable);
        return PageResponse.<OrderResponse>builder()
                .content(result.getContent().stream().map(this::toResponse).toList())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(UUID id, OrderStatusUpdateRequest request) {
        Order order = findOrder(id);
        OrderStatus newStatus = parseStatus(request.getNewStatus());
        OrderStatus currentStatus = order.getStatus();

        if (currentStatus == newStatus) {
            return toResponse(order);
        }
        if (TERMINAL_STATUSES.contains(currentStatus)) {
            throw new InvalidOrderStatusException(
                    "Đơn hàng đang ở trạng thái " + currentStatus + " nên không thể chuyển sang " + newStatus);
        }

        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);
        recordHistory(saved, currentStatus, newStatus, request.getNote());
        publishStatusChanged(saved, currentStatus, newStatus);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(UUID id) {
        Order order = findOrder(id);
        OrderStatus currentStatus = order.getStatus();
        if (NON_CANCELLABLE_STATUSES.contains(currentStatus)) {
            throw new InvalidOrderStatusException(
                    "Không thể hủy đơn hàng đang ở trạng thái " + currentStatus);
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);
        recordHistory(saved, currentStatus, OrderStatus.CANCELLED, "Hủy đơn hàng");
        publishStatusChanged(saved, currentStatus, OrderStatus.CANCELLED);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse.OrderHistoryResponse> getOrderHistory(UUID id) {
        findOrder(id);
        return orderHistoryRepository.findByOrderIdOrderByCreatedAtDesc(id).stream()
                .map(this::toHistoryResponse)
                .toList();
    }

    @Override
    @Transactional
    public OrderResponse processWebhook(String source, Object webhookPayload) {
        OrderSource orderSource = parseSource(source);

        OrderRequest request;
        try {
            request = objectMapper.convertValue(webhookPayload, OrderRequest.class);
        } catch (IllegalArgumentException e) {
            throw new InvalidOrderStatusException("Payload webhook không hợp lệ: " + e.getMessage());
        }
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new InvalidOrderStatusException("Payload webhook thiếu danh sách items");
        }
        // Khách từ kênh ngoài có thể chưa liên kết với CRM
        if (request.getCustomerId() == null || request.getCustomerId().isBlank()) {
            request.setCustomerId(UUID.randomUUID().toString());
        }
        request.setSource(orderSource.name());

        OrderResponse created = createOrder(request);

        if (webhookPayload instanceof Map<?, ?> payloadMap) {
            Object channelOrderId = payloadMap.get("channelOrderId");
            if (channelOrderId != null) {
                Order order = findOrder(created.getId());
                order.setChannelOrderId(channelOrderId.toString());
                created = toResponse(orderRepository.save(order));
            }
        }
        return created;
    }

    private Order findOrder(UUID id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Không tìm thấy đơn hàng với id: " + id));
    }

    private Specification<Order> buildSpecification(OrderSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
                String pattern = "%" + criteria.getKeyword().trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("orderCode")), pattern),
                        cb.like(cb.lower(root.get("customerName")), pattern),
                        cb.like(cb.lower(root.get("customerEmail")), pattern)));
            }
            if (criteria.getStatus() != null && !criteria.getStatus().isBlank()) {
                predicates.add(cb.equal(root.get("status"), parseStatus(criteria.getStatus())));
            }
            if (criteria.getSource() != null && !criteria.getSource().isBlank()) {
                predicates.add(cb.equal(root.get("source"), parseSource(criteria.getSource())));
            }
            if (criteria.getCustomerId() != null) {
                predicates.add(cb.equal(root.get("customerId"), criteria.getCustomerId()));
            }
            LocalDateTime start = parseDate(criteria.getStartDate(), false);
            if (start != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
            }
            LocalDateTime end = parseDate(criteria.getEndDate(), true);
            if (end != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), end));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private OrderHistory recordHistory(Order order, OrderStatus fromStatus, OrderStatus toStatus, String note) {
        OrderHistory history = OrderHistory.builder()
                .order(order)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .changedBy(SYSTEM_USER)
                .note(note)
                .build();
        return orderHistoryRepository.save(history);
    }

    private void publishOrderCreated(Order order) {
        OrderCreatedEvent event = new OrderCreatedEvent();
        fillBaseEvent(event, order, "ORDER_CREATED");
        event.setCustomerId(order.getCustomerId().toString());
        event.setTotal(order.getTotalAmount());
        event.setItems(order.getOrderItems().stream().map(item -> {
            Map<String, Object> map = new HashMap<>();
            map.put("productId", item.getProductId().toString());
            map.put("sku", item.getSku());
            map.put("quantity", item.getQuantity());
            map.put("unitPrice", item.getUnitPrice());
            return map;
        }).toList());
        sendEvent(ORDER_EVENTS_TOPIC, order, event);
    }

    private void publishStatusChanged(Order order, OrderStatus fromStatus, OrderStatus toStatus) {
        OrderStatusChangedEvent event = new OrderStatusChangedEvent();
        fillBaseEvent(event, order, "ORDER_STATUS_CHANGED");
        event.setFromStatus(fromStatus != null ? fromStatus.name() : null);
        event.setToStatus(toStatus.name());
        sendEvent(ORDER_STATUS_CHANGED_TOPIC, order, event);
    }

    private void fillBaseEvent(OrderEvent event, Order order, String eventType) {
        event.setEventId(OrderEvent.generateEventId());
        event.setOrderId(order.getId().toString());
        event.setOrderCode(order.getOrderCode());
        event.setEventType(eventType);
        event.setTimestamp(LocalDateTime.now());
    }

    private void sendEvent(String topic, Order order, OrderEvent event) {
        // Kafka lỗi không được làm hỏng giao dịch đặt hàng
        try {
            kafkaTemplate.send(topic, order.getId().toString(), event);
        } catch (Exception e) {
            log.warn("Không gửi được sự kiện {} cho đơn {}: {}",
                    event.getEventType(), order.getOrderCode(), e.getMessage());
        }
    }

    private UUID parseUuid(String value, String fieldName) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new InvalidOrderStatusException(fieldName + " không phải UUID hợp lệ: " + value);
        }
    }

    private OrderSource parseSource(String value) {
        try {
            return OrderSource.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new InvalidOrderStatusException("Nguồn đơn hàng không hợp lệ: " + value);
        }
    }

    private OrderStatus parseStatus(String value) {
        try {
            return OrderStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new InvalidOrderStatusException("Trạng thái đơn hàng không hợp lệ: " + value);
        }
    }

    private LocalDateTime parseDate(String value, boolean endOfDay) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDateTime.parse(value);
        } catch (DateTimeParseException ignored) {
            // thử tiếp định dạng yyyy-MM-dd
        }
        try {
            LocalDate date = LocalDate.parse(value);
            return endOfDay ? date.atTime(LocalTime.MAX) : date.atStartOfDay();
        } catch (DateTimeParseException e) {
            throw new InvalidOrderStatusException(
                    "Ngày không hợp lệ: " + value + " (định dạng yyyy-MM-dd)");
        }
    }

    private OrderResponse toResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .customerId(order.getCustomerId().toString())
                .customerName(order.getCustomerName())
                .customerEmail(order.getCustomerEmail())
                .customerPhone(order.getCustomerPhone())
                .customerAddress(order.getCustomerAddress())
                .source(order.getSource().name())
                .channelOrderId(order.getChannelOrderId())
                .status(order.getStatus().name())
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
                .items(order.getOrderItems().stream().map(this::toItemResponse).toList())
                .histories(order.getHistories().stream().map(this::toHistoryResponse).toList())
                .payments(order.getPayments().stream().map(this::toPaymentResponse).toList())
                .build();
    }

    private OrderResponse.OrderItemResponse toItemResponse(OrderItem item) {
        return OrderResponse.OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProductId().toString())
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

    private OrderResponse.OrderHistoryResponse toHistoryResponse(OrderHistory history) {
        return OrderResponse.OrderHistoryResponse.builder()
                .id(history.getId())
                .fromStatus(history.getFromStatus() != null ? history.getFromStatus().name() : null)
                .toStatus(history.getToStatus().name())
                .changedBy(history.getChangedBy())
                .note(history.getNote())
                .createdAt(history.getCreatedAt())
                .build();
    }

    private PaymentResponse toPaymentResponse(PaymentInfo payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId().toString())
                .paymentMethod(payment.getPaymentMethod())
                .transactionId(payment.getTransactionId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .paidAt(payment.getPaidAt())
                .gatewayResponse(payment.getGatewayResponse())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
