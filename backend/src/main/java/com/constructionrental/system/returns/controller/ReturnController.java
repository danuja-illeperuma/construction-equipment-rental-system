package com.constructionrental.system.returns.controller;

import com.constructionrental.system.common.dto.ApiResponse;
import com.constructionrental.system.returns.dto.request.EquipmentReturnRequest;
import com.constructionrental.system.returns.dto.response.EquipmentReturnResponse;
import com.constructionrental.system.returns.service.ReturnService;
import com.constructionrental.system.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/returns")
public class ReturnController {

    private final ReturnService returnService;

    public ReturnController(ReturnService returnService) {
        this.returnService = returnService;
    }

    /**
     * Process return for rental item.
     * Accessible by Staff, Manager, Admin only.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<EquipmentReturnResponse>> recordReturn(
            @Valid @RequestBody EquipmentReturnRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        EquipmentReturnResponse response = returnService.recordReturn(request, principal);
        return new ResponseEntity<>(ApiResponse.success(response, "Equipment return recorded successfully"), HttpStatus.CREATED);
    }

    /**
     * Retrieve all equipment returns.
     * Accessible by Staff, Manager, Admin only.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<EquipmentReturnResponse>>> getAllReturns(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(returnService.getAllReturns(principal)));
    }

    /**
     * Retrieve equipment return details by ID.
     * Accessible by Staff, Manager, Admin only.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<EquipmentReturnResponse>> getReturnById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(returnService.getReturnById(id, principal)));
    }

    /**
     * Retrieve returns by rental ID.
     * Accessible by Staff, Manager, Admin only.
     */
    @GetMapping("/rental/{rentalId}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<EquipmentReturnResponse>>> getReturnsByRentalId(
            @PathVariable Long rentalId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(returnService.getReturnsByRentalId(rentalId, principal)));
    }

    /**
     * Preview late penalty charges using MySQL User-Defined Function `calculate_late_charge`.
     */
    @GetMapping("/items/{rentalItemId}/late-charge")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<BigDecimal>> getLateCharge(
            @PathVariable Long rentalItemId,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) LocalDateTime returnedAt) {
        BigDecimal lateCharge = returnService.calculateLateCharge(rentalItemId, returnedAt);
        return ResponseEntity.ok(ApiResponse.success(lateCharge));
    }
}
