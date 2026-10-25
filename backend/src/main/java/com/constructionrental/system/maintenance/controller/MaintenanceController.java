package com.constructionrental.system.maintenance.controller;

import com.constructionrental.system.common.dto.ApiResponse;
import com.constructionrental.system.maintenance.dto.request.MaintenanceCompleteRequest;
import com.constructionrental.system.maintenance.dto.request.MaintenanceRequest;
import com.constructionrental.system.maintenance.dto.response.EquipmentMaintenanceSummaryResponse;
import com.constructionrental.system.maintenance.dto.response.MaintenanceResponse;
import com.constructionrental.system.maintenance.service.MaintenanceService;
import com.constructionrental.system.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<MaintenanceResponse>>> getAllMaintenance(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long equipmentId) {
        return ResponseEntity.ok(ApiResponse.success(maintenanceService.getAllMaintenance(status, equipmentId)));
    }

    /**
     * Workshop dashboard view displaying machinery maintenance summary
     * using MySQL View `v_equipment_maintenance_summary`.
     */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<EquipmentMaintenanceSummaryResponse>>> getMaintenanceSummary() {
        return ResponseEntity.ok(ApiResponse.success(maintenanceService.getMaintenanceSummary()));
    }

    /**
     * Computes maintenance expenditure for an equipment using MySQL scalar function `calculate_equipment_maintenance_cost`.
     */
    @GetMapping("/equipment/{equipmentId}/cost")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<BigDecimal>> getEquipmentMaintenanceCost(
            @PathVariable Long equipmentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        BigDecimal totalCost = maintenanceService.calculateMaintenanceCost(equipmentId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(totalCost));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> getMaintenanceById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(maintenanceService.getMaintenanceById(id)));
    }

    @GetMapping("/equipment/{equipmentId}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<MaintenanceResponse>>> getMaintenanceByEquipment(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(ApiResponse.success(maintenanceService.getMaintenanceByEquipment(equipmentId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> scheduleMaintenance(
            @Valid @RequestBody MaintenanceRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long staffUserId = principal != null ? principal.getId() : 1L;
        MaintenanceResponse response = maintenanceService.scheduleMaintenance(request, staffUserId);
        return new ResponseEntity<>(ApiResponse.success(response, "Maintenance scheduled and equipment marked as MAINTENANCE"), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> updateMaintenance(
            @PathVariable Long id,
            @Valid @RequestBody MaintenanceRequest request) {
        MaintenanceResponse response = maintenanceService.updateMaintenance(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Maintenance record updated successfully"));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> completeMaintenance(
            @PathVariable Long id,
            @RequestBody(required = false) MaintenanceCompleteRequest request) {
        MaintenanceResponse response;
        if (request != null && (request.getNotes() != null || request.getActualCost() != null)) {
            response = maintenanceService.completeMaintenance(id, request.getNotes(), request.getActualCost());
        } else {
            response = maintenanceService.completeMaintenance(id);
        }
        return ResponseEntity.ok(ApiResponse.success(response, "Maintenance marked as COMPLETED and equipment restored to AVAILABLE"));
    }

    @PatchMapping("/{id}/mark-paid")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> markAsPaid(
            @PathVariable Long id,
            @RequestParam(required = false) Long customerId,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long staffUserId = principal != null ? principal.getId() : 1L;
        MaintenanceResponse response = maintenanceService.markAsPaid(id, customerId, staffUserId);
        return ResponseEntity.ok(ApiResponse.success(response, "Maintenance charge marked as paid"));
    }

    @PatchMapping("/{id}/mark-unpaid")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> markAsUnpaid(
            @PathVariable Long id,
            @RequestParam(required = false) Long customerId,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long staffUserId = principal != null ? principal.getId() : 1L;
        MaintenanceResponse response = maintenanceService.markAsUnpaid(id, customerId, staffUserId);
        return ResponseEntity.ok(ApiResponse.success(response, "Maintenance charge marked as unpaid"));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<com.constructionrental.system.maintenance.dto.response.CustomerMaintenanceSummaryResponse>> getCustomerMaintenance(
            @PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.success(maintenanceService.getCustomerMaintenanceSummary(customerId)));
    }

    @GetMapping("/my-charges")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<com.constructionrental.system.maintenance.dto.response.CustomerMaintenanceSummaryResponse>> getMyMaintenanceCharges(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(maintenanceService.getCustomerMaintenanceSummary(principal.getId())));
    }
}
