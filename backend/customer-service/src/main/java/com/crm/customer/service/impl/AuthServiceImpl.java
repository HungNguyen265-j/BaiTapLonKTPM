package com.crm.customer.service.impl;

import com.crm.customer.dto.*;
import com.crm.customer.exception.AuthException;
import com.crm.customer.model.AppUser;
import com.crm.customer.model.Customer;
import com.crm.customer.repository.AppUserRepository;
import com.crm.customer.service.AuthService;
import com.crm.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AppUserRepository appUserRepository;
    private final CustomerService customerService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Giới hạn số tài khoản khách tự đăng ký (yêu cầu đề bài: tối đa 40-50 người)
    @Value("${app.auth.max-customer-accounts:50}")
    private int maxCustomerAccounts;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (appUserRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new AuthException(HttpStatus.CONFLICT, "Email này đã được đăng ký");
        }
        long customerCount = appUserRepository.countByRole(AppUser.Role.CUSTOMER);
        if (customerCount >= maxCustomerAccounts) {
            throw new AuthException(HttpStatus.BAD_REQUEST,
                    "Đã đạt giới hạn " + maxCustomerAccounts + " tài khoản khách hàng, không thể đăng ký thêm");
        }

        CustomerResponse customer;
        try {
            customer = customerService.createCustomer(CustomerRequest.builder()
                    .name(request.getName())
                    .email(request.getEmail())
                    .phone(request.getPhone())
                    .address(request.getAddress())
                    .city(request.getCity())
                    .source(Customer.Source.API)
                    .build());
        } catch (DataIntegrityViolationException e) {
            throw new AuthException(HttpStatus.CONFLICT, "Email này đã tồn tại trong danh sách khách hàng");
        }

        AppUser user = appUserRepository.save(AppUser.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role(AppUser.Role.CUSTOMER)
                .customerId(customer.getId())
                .build());

        log.info("Registered customer account {} ({}/{})", user.getEmail(), customerCount + 1, maxCustomerAccounts);
        return toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new AuthException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng");
        }
        return toResponse(user);
    }

    @Override
    @Transactional
    public void resetPassword(ForgotPasswordRequest request) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new AuthException(HttpStatus.UNAUTHORIZED, "Thông tin xác minh không đúng"));
        if (user.getRole() != AppUser.Role.CUSTOMER || user.getCustomerId() == null) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Tài khoản này không hỗ trợ tự đặt lại mật khẩu");
        }
        CustomerResponse customer = customerService.getCustomer(user.getCustomerId());
        if (!normalizePhone(request.getPhone()).equals(normalizePhone(customer.getPhone()))) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Thông tin xác minh không đúng");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        appUserRepository.save(user);
        log.info("Password reset for customer account {}", user.getEmail());
    }

    // So khớp SĐT bỏ qua khoảng trắng/dấu chấm/gạch và tiền tố +84 vs 0
    private String normalizePhone(String phone) {
        if (phone == null) return "";
        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.startsWith("84")) digits = "0" + digits.substring(2);
        return digits;
    }

    private AuthResponse toResponse(AppUser user) {
        // Token demo (không phải JWT ký thật) — đủ dùng khi gateway chạy chế độ APP_SECURITY_ENABLED=false
        String token = Base64.getUrlEncoder().withoutPadding()
                .encodeToString((user.getId() + ":" + UUID.randomUUID()).getBytes());
        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .name(user.getName())
                .email(user.getEmail())
                .customerId(user.getCustomerId())
                .build();
    }
}
