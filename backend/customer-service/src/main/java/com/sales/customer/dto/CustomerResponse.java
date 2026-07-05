package com.sales.customer.dto;

import com.sales.customer.model.Customer;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerResponse {

    private UUID id;
    private String code;
    private String name;
    private String email;
    private String phone;
    private Customer.Gender gender;
    private LocalDate birthday;
    private String address;
    private String city;
    private String district;
    private String ward;
    private String avatar;
    private Customer.Tier tier;
    private Integer totalOrders;
    private Double totalSpent;
    private Integer totalReturns;
    private Customer.Source source;
    private Map<String, Object> tags;
    private String notes;
    private Customer.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
