package com.constructionrental.system.customer.controller;

import com.constructionrental.system.common.dto.ApiResponse;
import com.constructionrental.system.customer.dto.CustomerProfileUpdateRequest;
import com.constructionrental.system.customer.dto.CustomerResponse;
import com.constructionrental.system.customer.dto.CustomerStatusUpdateRequest;
import com.constructionrental.system.customer.service.CustomerService;
import com.constructionrental.system.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCurrentCustomerProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        CustomerResponse response = customerService.getCustomerById(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCurrentCustomerProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CustomerProfileUpdateRequest request) {
        CustomerResponse response = customerService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Customer profile updated successfully"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> getAllCustomers() {
        List<CustomerResponse> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(ApiResponse.success(customers));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(@PathVariable Long id) {
        CustomerResponse response = customerService.getCustomerById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomerStatus(
            @PathVariable Long id,
            @Valid @RequestBody CustomerStatusUpdateRequest request) {
        CustomerResponse response = customerService.updateStatus(id, request.getIsActive());
        return ResponseEntity.ok(ApiResponse.success(response, "Customer status updated successfully"));
    }
}
