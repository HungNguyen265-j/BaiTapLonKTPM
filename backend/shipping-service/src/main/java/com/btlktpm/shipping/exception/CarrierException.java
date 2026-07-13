package com.btlktpm.shipping.exception;

public class CarrierException extends RuntimeException {
    public CarrierException(String message) {
        super(message);
    }

    public CarrierException(String message, Throwable cause) {
        super(message, cause);
    }
}
