package com.sales.customer.service.impl;

import com.sales.customer.dto.CustomerRequest;
import com.sales.customer.dto.CustomerResponse;
import com.sales.customer.dto.CustomerSearchCriteria;
import com.sales.customer.dto.PageResponse;
import com.sales.customer.exception.CustomerNotFoundException;
import com.sales.customer.model.Customer;
import com.sales.customer.repository.CustomerRepository;
import com.sales.customer.service.CustomerService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        Customer customer = Customer.builder()
                .code("CUS" + System.currentTimeMillis())
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
                .source(request.getSource())
                .tags(request.getTags())
                .notes(request.getNotes())
                .build();
        customer = customerRepository.save(customer);
        log.info("Customer created: {} ({})", customer.getId(), customer.getCode());
        return toResponse(customer);
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomer(UUID id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found: " + id));
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
        customer.setSource(request.getSource());
        customer.setTags(request.getTags());
        customer.setNotes(request.getNotes());
        customer = customerRepository.save(customer);
        log.info("Customer updated: {}", id);
        return toResponse(customer);
    }

    @Override
    public CustomerResponse getCustomer(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found: " + id));
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
            throw new CustomerNotFoundException("Customer not found: " + id);
        }
        customerRepository.deleteById(id);
        log.info("Customer deleted: {}", id);
    }

    @Override
    public PageResponse<CustomerResponse> searchCustomers(CustomerSearchCriteria criteria) {
        Specification<Customer> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (criteria.getKeyword() != null && !criteria.getKeyword().isEmpty()) {
                String pattern = "%" + criteria.getKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("code")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(root.get("phone"), pattern)
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
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), criteria.getStartDate()));
            }
            if (criteria.getEndDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), criteria.getEndDate()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        int page = criteria.getPage();
        int size = criteria.getSize();
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Customer> customerPage = customerRepository.findAll(spec, pageRequest);
        return PageResponse.<CustomerResponse>builder()
                .content(customerPage.getContent().stream().map(this::toResponse).toList())
                .page(customerPage.getNumber())
                .size(customerPage.getSize())
                .totalElements(customerPage.getTotalElements())
                .totalPages(customerPage.getTotalPages())
                .first(customerPage.isFirst())
                .last(customerPage.isLast())
                .build();
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
}
