package com.constructionrental.system.config;

import com.constructionrental.system.common.exception.ErrorResponse;
import com.constructionrental.system.security.JwtAuthenticationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectMapper objectMapper;

    @Value("${cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, ObjectMapper objectMapper) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.objectMapper = objectMapper;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);

            ErrorResponse error = new ErrorResponse(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Unauthorized",
                    "Full authentication is required to access this resource: " + authException.getMessage(),
                    request.getRequestURI()
            );

            objectMapper.writeValue(response.getOutputStream(), error);
        };
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);

            ErrorResponse error = new ErrorResponse(
                    HttpServletResponse.SC_FORBIDDEN,
                    "Forbidden",
                    "You do not have permission to access this resource: " + accessDeniedException.getMessage(),
                    request.getRequestURI()
            );

            objectMapper.writeValue(response.getOutputStream(), error);
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        if (origins.isEmpty()) {
            origins = List.of(
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "http://localhost:3000",
                    "http://127.0.0.1:3000"
            );
        }

        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint())
                        .accessDeniedHandler(accessDeniedHandler())
                )
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/v1/auth/login", "/api/v1/auth/register").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/api/test/**").permitAll()
                        .requestMatchers("/api/v1/payhere/notify", "/api/v1/payments/payhere/notify").permitAll()
                        .requestMatchers("/api/v1/payments/simulate", "/api/v1/payments/*/simulate").permitAll()

                        // Customer maintenance fee checking
                        .requestMatchers("/api/v1/maintenance/my-charges").authenticated()

                        // Module 5 Maintenance: STAFF, ADMIN
                        .requestMatchers("/api/v1/maintenance/**", "/api/v1/equipment/*/maintenance").hasAnyRole("STAFF", "ADMIN")

                        // Public read-only fleet catalog and category browsing endpoints
                        .requestMatchers(HttpMethod.GET, "/api/v1/equipment", "/api/v1/equipment/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories", "/api/v1/categories/**").permitAll()

                        // Public rental availability and quotation checking endpoints (Phase 2 & Phase 4)
                        .requestMatchers(HttpMethod.POST, "/api/v1/rentals/availability", "/api/v1/rentals/check-availability", "/api/v1/rentals/calculate-quote", "/api/v1/rentals/quote").permitAll()

                        // Reports & Audit Logs: STAFF, ADMIN
                        .requestMatchers("/api/v1/reports/**").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers("/api/v1/audit-logs/**").hasAnyRole("STAFF", "ADMIN")


                        // Any other request must be authenticated (role guards enforced at controller/method level)
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
