package com.sales.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoders;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:http://localhost:8181/realms/sales-management}")
    private String issuerUri;

    // Demo mode: set APP_SECURITY_ENABLED=false to bypass Keycloak (no identity provider in docker-compose)
    @Value("${app.security.enabled:true}")
    private boolean securityEnabled;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        if (!securityEnabled) {
            return http
                    .csrf(ServerHttpSecurity.CsrfSpec::disable)
                    .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                    .authorizeExchange(exchanges -> exchanges.anyExchange().permitAll())
                    .build();
        }
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers("/actuator/health", "/actuator/info").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/products/**").hasAuthority("SCOPE_read:products")
                        .pathMatchers(HttpMethod.POST, "/api/products/**").hasAuthority("SCOPE_write:products")
                        .pathMatchers(HttpMethod.PUT, "/api/products/**").hasAuthority("SCOPE_write:products")
                        .pathMatchers(HttpMethod.DELETE, "/api/products/**").hasAuthority("SCOPE_admin")
                        .pathMatchers(HttpMethod.GET, "/api/inventory/**").hasAuthority("SCOPE_read:inventory")
                        .pathMatchers(HttpMethod.POST, "/api/inventory/**").hasAuthority("SCOPE_write:inventory")
                        .pathMatchers(HttpMethod.GET, "/api/orders/**").hasAuthority("SCOPE_read:orders")
                        .pathMatchers(HttpMethod.POST, "/api/orders/**").hasAuthority("SCOPE_write:orders")
                        .pathMatchers(HttpMethod.PUT, "/api/orders/**").hasAuthority("SCOPE_write:orders")
                        .pathMatchers(HttpMethod.GET, "/api/customers/**").hasAuthority("SCOPE_read:customers")
                        .pathMatchers(HttpMethod.POST, "/api/customers/**").hasAuthority("SCOPE_write:customers")
                        .pathMatchers(HttpMethod.GET, "/api/promotions/**").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/promotions/**").hasAuthority("SCOPE_write:promotions")
                        .pathMatchers("/api/reports/**").hasAuthority("SCOPE_read:reports")
                        .pathMatchers("/api/shipping/**").hasAuthority("SCOPE_write:shipping")
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .jwtDecoder(jwtDecoder())
                        )
                )
                .build();
    }

    @Bean
    @ConditionalOnProperty(name = "app.security.enabled", havingValue = "true", matchIfMissing = true)
    public ReactiveJwtDecoder jwtDecoder() {
        return ReactiveJwtDecoders.fromIssuerLocation(issuerUri);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
