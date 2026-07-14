package com.reportservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Khớp với CustomerResponse thật của customer-service. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerResponse {
    private String id;
    private String code;
    private String name;
    private String email;
    private String phone;
    private String tier;
    private String source;
    private LocalDateTime createdAt;
}
