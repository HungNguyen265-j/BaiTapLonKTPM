package com.sales.inventory.exception;

public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(String message) {
        super(message);
    }

    public InsufficientStockException(String productSku, Integer requested, Integer available) {
        super("Insufficient stock for SKU: " + productSku +
              ". Requested: " + requested + ", Available: " + available);
    }
}
