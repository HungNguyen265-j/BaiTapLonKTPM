package com.sales.customer.exception;

import java.util.UUID;

public class CustomerNotFoundException extends RuntimeException {

    public CustomerNotFoundException(UUID id) {
        super("Customer not found with id: " + id);
    }

    public CustomerNotFoundException(String message) {
        super(message);
    }
}
