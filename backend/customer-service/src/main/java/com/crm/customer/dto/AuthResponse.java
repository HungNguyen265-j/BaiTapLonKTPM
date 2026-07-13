package com.crm.customer.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String role;
    private String name;
    private String email;
    private UUID customerId;
}
