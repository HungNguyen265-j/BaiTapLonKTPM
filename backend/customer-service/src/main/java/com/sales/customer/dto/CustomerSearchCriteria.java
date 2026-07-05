package com.sales.customer.dto;

import com.sales.customer.model.Customer;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerSearchCriteria {

    private String keyword;
    private Customer.Tier tier;
    private Customer.Status status;
    private Customer.Source source;
    private LocalDate startDate;
    private LocalDate endDate;

    @Builder.Default
    private int page = 0;

    @Builder.Default
    private int size = 20;

    @Builder.Default
    private String sort = "createdAt";
}
