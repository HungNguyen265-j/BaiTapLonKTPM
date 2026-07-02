package com.sales.promotion.exception;

public class InvalidCouponException extends RuntimeException {

    public InvalidCouponException(String message) {
        super(message);
    }
}
