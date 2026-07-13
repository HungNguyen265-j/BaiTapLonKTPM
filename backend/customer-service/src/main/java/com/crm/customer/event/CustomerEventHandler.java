package com.crm.customer.event;

import com.crm.customer.model.Customer;
import com.crm.customer.repository.CustomerRepository;
import com.crm.customer.service.TierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class CustomerEventHandler {

    private final CustomerRepository customerRepository;
    private final TierService tierService;

    @KafkaListener(topics = "order-events", groupId = "customer-service")
    @Transactional
    public void handleOrderEvent(Map<String, Object> event) {
        try {
            String eventType = (String) event.get("eventType");
            UUID customerId = UUID.fromString((String) event.get("customerId"));

            Customer customer = customerRepository.findById(customerId).orElse(null);
            if (customer == null) {
                log.warn("Customer not found: {}", customerId);
                return;
            }

            switch (eventType) {
                case "ORDER_CREATED" -> {
                    customer.setTotalOrders(customer.getTotalOrders() + 1);
                    Double orderTotal = event.get("totalAmount") != null
                            ? ((Number) event.get("totalAmount")).doubleValue() : 0.0;
                    customer.setTotalSpent(customer.getTotalSpent() + orderTotal);
                }
                case "ORDER_RETURNED" -> {
                    customer.setTotalReturns(customer.getTotalReturns() + 1);
                    Double returnAmount = event.get("returnAmount") != null
                            ? ((Number) event.get("returnAmount")).doubleValue() : 0.0;
                    customer.setTotalSpent(customer.getTotalSpent() - returnAmount);
                }
                case "ORDER_CANCELLED" -> {
                    customer.setTotalOrders(Math.max(0, customer.getTotalOrders() - 1));
                    Double orderTotal = event.get("totalAmount") != null
                            ? ((Number) event.get("totalAmount")).doubleValue() : 0.0;
                    customer.setTotalSpent(customer.getTotalSpent() - orderTotal);
                }
                default -> log.debug("Unhandled event type: {}", eventType);
            }

            Customer.Tier oldTier = customer.getTier();
            Customer.Tier newTier = tierService.calculateTier(customer.getTotalSpent());
            customer.setTier(newTier);

            customerRepository.save(customer);

            if (oldTier != newTier) {
                log.info("Customer {} tier changed from {} to {}", customerId, oldTier, newTier);
            }
        } catch (Exception e) {
            log.error("Error processing order event: {}", e.getMessage(), e);
        }
    }
}
