package com.crm.customer.service;

import com.crm.customer.dto.AuthResponse;
import com.crm.customer.dto.ForgotPasswordRequest;
import com.crm.customer.dto.LoginRequest;
import com.crm.customer.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    void resetPassword(ForgotPasswordRequest request);
}
