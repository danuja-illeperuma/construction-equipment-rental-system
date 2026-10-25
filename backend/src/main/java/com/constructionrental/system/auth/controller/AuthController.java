package com.constructionrental.system.auth.controller;

import com.constructionrental.system.auth.dto.request.LoginRequest;
import com.constructionrental.system.auth.dto.response.LoginResponse;
import com.constructionrental.system.auth.dto.response.MeResponse;
import com.constructionrental.system.auth.service.AuthService;
import com.constructionrental.system.common.dto.ApiResponse;
import com.constructionrental.system.customer.dto.CustomerRegisterRequest;
import com.constructionrental.system.customer.dto.CustomerResponse;
import com.constructionrental.system.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<CustomerResponse>> registerCustomer(
            @Valid @RequestBody CustomerRegisterRequest request) {
        CustomerResponse response = authService.registerCustomer(request);
        return new ResponseEntity<>(ApiResponse.success(response, "Customer registered successfully"), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MeResponse>> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal principal) {
        MeResponse response = authService.getMe(principal);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }
}
