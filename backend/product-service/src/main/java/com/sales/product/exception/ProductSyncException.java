package com.sales.product.exception;

public class ProductSyncException extends RuntimeException {

    public ProductSyncException(String message) {
        super(message);
    }

    public ProductSyncException(String message, Throwable cause) {
        super(message, cause);
    }
}
