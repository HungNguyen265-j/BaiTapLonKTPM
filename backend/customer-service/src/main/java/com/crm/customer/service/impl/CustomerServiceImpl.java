package com.crm.customer.service.impl;

import com.crm.customer.dto.CustomerRequest;
import com.crm.customer.dto.CustomerResponse;
import com.crm.customer.dto.CustomerSearchCriteria;
import com.crm.customer.dto.PageResponse;
import com.crm.customer.event.CustomerCreatedEvent;
import com.crm.customer.event.CustomerEvent;
import com.crm.customer.exception.CustomerNotFoundException;
import com.crm.customer.model.Customer;
import com.crm.customer.repository.CustomerRepository;
import com.crm.customer.service.CustomerService;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final KafkaTemplate<String, CustomerEvent> kafkaTemplate;

    @Override
    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        Customer customer = Customer.builder()
                .code(generateCode())
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .gender(request.getGender())
                .birthday(request.getBirthday())
                .address(request.getAddress())
                .city(request.getCity())
                .district(request.getDistrict())
                .ward(request.getWard())
                .avatar(request.getAvatar())
                .source(request.getSource() != null ? request.getSource() : Customer.Source.MANUAL)
                .tags(request.getTags())
                .notes(request.getNotes())
                .build();

        customer = customerRepository.save(customer);

        // Lỗi phát event không được làm hỏng việc tạo khách (đăng ký tài khoản phụ thuộc hàm này)
        try {
            kafkaTemplate.send("customer-events", CustomerCreatedEvent.builder()
                    .customerId(customer.getId())
                    .eventType("CUSTOMER_CREATED")
                    .build());
        } catch (Exception e) {
            log.warn("Không gửi được CUSTOMER_CREATED event cho {}: {}", customer.getId(), e.getMessage());
        }

        return toResponse(customer);
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomer(UUID id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));

        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setGender(request.getGender());
        customer.setBirthday(request.getBirthday());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setDistrict(request.getDistrict());
        customer.setWard(request.getWard());
        customer.setAvatar(request.getAvatar());
        if (request.getSource() != null) {
            customer.setSource(request.getSource());
        }
        customer.setTags(request.getTags());
        customer.setNotes(request.getNotes());

        customer = customerRepository.save(customer);
        return toResponse(customer);
    }

    @Override
    public CustomerResponse getCustomer(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));
        return toResponse(customer);
    }

    @Override
    public CustomerResponse getCustomerByCode(String code) {
        Customer customer = customerRepository.findByCode(code)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with code: " + code));
        return toResponse(customer);
    }

    @Override
    @Transactional
    public void deleteCustomer(UUID id) {
        if (!customerRepository.existsById(id)) {
            throw new CustomerNotFoundException(id);
        }
        customerRepository.deleteById(id);
    }

    @Override
    public PageResponse<CustomerResponse> searchCustomers(CustomerSearchCriteria criteria) {
        Specification<Customer> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
                String pattern = "%" + criteria.getKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(root.get("phone"), pattern),
                        cb.like(cb.lower(root.get("code")), pattern)
                ));
            }
            if (criteria.getTier() != null) {
                predicates.add(cb.equal(root.get("tier"), criteria.getTier()));
            }
            if (criteria.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), criteria.getStatus()));
            }
            if (criteria.getSource() != null) {
                predicates.add(cb.equal(root.get("source"), criteria.getSource()));
            }
            if (criteria.getStartDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"),
                        criteria.getStartDate().atStartOfDay()));
            }
            if (criteria.getEndDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"),
                        criteria.getEndDate().atTime(LocalTime.MAX)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.by(Sort.Direction.DESC, criteria.getSort());
        Pageable pageable = PageRequest.of(criteria.getPage(), criteria.getSize(), sort);

        Page<Customer> page = customerRepository.findAll(spec, pageable);
        Page<CustomerResponse> responsePage = page.map(this::toResponse);

        return PageResponse.from(responsePage);
    }

    private CustomerResponse toResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .code(customer.getCode())
                .name(customer.getName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .gender(customer.getGender())
                .birthday(customer.getBirthday())
                .address(customer.getAddress())
                .city(customer.getCity())
                .district(customer.getDistrict())
                .ward(customer.getWard())
                .avatar(customer.getAvatar())
                .tier(customer.getTier())
                .totalOrders(customer.getTotalOrders())
                .totalSpent(customer.getTotalSpent())
                .totalReturns(customer.getTotalReturns())
                .source(customer.getSource())
                .tags(customer.getTags())
                .notes(customer.getNotes())
                .status(customer.getStatus())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }

    private String generateCode() {
        return "KH" + System.currentTimeMillis();
    }
}
