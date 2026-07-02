package com.crm.customer.service;

import com.crm.customer.dto.CustomerRequest;
import com.crm.customer.dto.CustomerResponse;
import com.crm.customer.dto.CustomerSearchCriteria;
import com.crm.customer.dto.PageResponse;

import java.util.UUID;

public interface CustomerService {

    CustomerResponse createCustomer(CustomerRequest request);

    CustomerResponse updateCustomer(UUID id, CustomerRequest request);

    CustomerResponse getCustomer(UUID id);

    CustomerResponse getCustomerByCode(String code);

    void deleteCustomer(UUID id);

    PageResponse<CustomerResponse> searchCustomers(CustomerSearchCriteria criteria);
}
