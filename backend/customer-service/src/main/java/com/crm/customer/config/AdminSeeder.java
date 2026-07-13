package com.crm.customer.config;

import com.crm.customer.model.AppUser;
import com.crm.customer.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder {

    @Bean
    public CommandLineRunner seedAdminAccount(AppUserRepository appUserRepository) {
        return args -> {
            if (appUserRepository.countByRole(AppUser.Role.ADMIN) == 0) {
                appUserRepository.save(AppUser.builder()
                        .email("admin@salehub.vn")
                        .passwordHash(new BCryptPasswordEncoder().encode("admin123"))
                        .name("Quản trị viên")
                        .role(AppUser.Role.ADMIN)
                        .build());
                log.info("Seeded default admin account admin@salehub.vn");
            }
        };
    }
}
