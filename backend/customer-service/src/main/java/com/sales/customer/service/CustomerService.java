package com.sales.customer.service;

import com.sales.customer.dto.CustomerRequest;
import com.sales.customer.dto.CustomerResponse;
import com.sales.customer.dto.CustomerSearchCriteria;
import com.sales.customer.dto.PageResponse;

import java.util.UUID;

public interface CustomerService {

    CustomerResponse createCustomer(CustomerRequest request);

    CustomerResponse updateCustomer(UUID id, CustomerRequest request);

    CustomerResponse getCustomer(UUID id);

    CustomerResponse getCustomerByCode(String code);

    void deleteCustomer(UUID id);

    PageResponse<CustomerResponse> searchCustomers(CustomerSearchCriteria criteria);
}
