package com.constructionrental.system.returns.controller;

import com.constructionrental.system.common.dto.ApiResponse;
import com.constructionrental.system.returns.dto.request.DamageReportRequest;
import com.constructionrental.system.returns.dto.response.DamageReportResponse;
import com.constructionrental.system.returns.service.DamageReportService;
import com.constructionrental.system.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/damage-reports")
public class DamageReportController {

    private final DamageReportService damageReportService;

    public DamageReportController(DamageReportService damageReportService) {
        this.damageReportService = damageReportService;
    }

    /**
     * Create damage report for a returned item.
     * Accessible by Staff, Manager, Admin only.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<DamageReportResponse>> createDamageReport(
            @Valid @RequestBody DamageReportRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        DamageReportResponse response = damageReportService.createDamageReport(request, principal);
        return new ResponseEntity<>(ApiResponse.success(response, "Damage report created successfully"), HttpStatus.CREATED);
    }

    /**
     * Retrieve all damage reports.
     * Accessible by Staff, Manager, Admin only.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<DamageReportResponse>>> getAllDamageReports(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(damageReportService.getAllDamageReports(principal)));
    }

    /**
     * Retrieve damage report by ID.
     * Accessible by Staff, Manager, Admin only.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<DamageReportResponse>> getDamageReportById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(damageReportService.getDamageReportById(id, principal)));
    }

    /**
     * Retrieve damage reports for a specific return.
     * Accessible by Staff, Manager, Admin only.
     */
    @GetMapping("/return/{returnId}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<DamageReportResponse>>> getDamageReportsByReturnId(
            @PathVariable Long returnId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(damageReportService.getDamageReportsByReturnId(returnId, principal)));
    }
}
