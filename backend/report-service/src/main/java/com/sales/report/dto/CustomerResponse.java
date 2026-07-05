package com.sales.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerResponse {
    private String id;
    private String name;
    private String email;
    private String phone;
    private LocalDate registeredDate;
    private LocalDateTime createdAt;
    private String channel;
}
