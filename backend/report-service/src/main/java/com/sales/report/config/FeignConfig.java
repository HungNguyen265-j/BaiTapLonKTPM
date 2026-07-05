package com.sales.report.config;

import feign.Logger;
import feign.Retryer;
import feign.codec.ErrorDecoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class FeignConfig {

    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.BASIC;
    }

    @Bean
    public Retryer feignRetryer() {
        return new Retryer.Default(100L, TimeUnit.SECONDS.toMillis(1L), 3);
    }

    @Bean
    public ErrorDecoder feignErrorDecoder() {
        return (methodKey, response) -> {
            String message = String.format("Feign client error: %s %s, status=%d, body=%s",
                    response.request().httpMethod(),
                    response.request().url(),
                    response.status(),
                    response.body() != null ? "body present" : "no body");
            if (response.status() >= 500) {
                return new RuntimeException(message + " (server error)");
            } else if (response.status() >= 400) {
                return new RuntimeException(message + " (client error)");
            }
            return new RuntimeException(message);
        };
    }
}
