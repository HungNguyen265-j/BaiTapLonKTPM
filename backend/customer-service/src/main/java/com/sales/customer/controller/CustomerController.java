package com.sales.customer.controller;

import com.sales.customer.dto.*;
import com.sales.customer.model.CustomerAddress;
import com.sales.customer.model.CustomerInteraction;
import com.sales.customer.repository.CustomerAddressRepository;
import com.sales.customer.service.CustomerInteractionService;
import com.sales.customer.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final CustomerInteractionService interactionService;
    private final CustomerAddressRepository addressRepository;

    @PostMapping
    public ResponseEntity<CustomerResponse> createCustomer(@Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.createCustomer(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> updateCustomer(@PathVariable UUID id,
                                                            @Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(customerService.updateCustomer(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomer(@PathVariable UUID id) {
        return ResponseEntity.ok(customerService.getCustomer(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<CustomerResponse> getCustomerByCode(@PathVariable String code) {
        return ResponseEntity.ok(customerService.getCustomerByCode(code));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable UUID id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<CustomerResponse>> searchCustomers(CustomerSearchCriteria criteria) {
        return ResponseEntity.ok(customerService.searchCustomers(criteria));
    }

    @GetMapping("/{id}/interactions")
    public ResponseEntity<List<CustomerInteraction>> getInteractions(@PathVariable UUID id) {
        return ResponseEntity.ok(interactionService.getInteractions(id));
    }

    @PostMapping("/{id}/interactions")
    public ResponseEntity<CustomerInteraction> addInteraction(@PathVariable UUID id,
                                                               @Valid @RequestBody CustomerInteractionRequest request,
                                                               @RequestHeader(value = "X-Handled-By", required = false) String handledBy) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(interactionService.addInteraction(id, request, handledBy));
    }

    @PostMapping("/{id}/tier")
    public ResponseEntity<CustomerResponse> updateTier(@PathVariable UUID id,
                                                        @Valid @RequestBody TierUpgradeRequest request) {
        CustomerResponse customer = customerService.getCustomer(id);
        CustomerResponse updated = CustomerResponse.builder()
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
                .tier(request.getTier())
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
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/addresses")
    public ResponseEntity<List<CustomerAddress>> getAddresses(@PathVariable UUID id) {
        return ResponseEntity.ok(addressRepository.findByCustomerId(id));
    }
}
