package com.constructionrental.system.equipment.controller;

import com.constructionrental.system.common.dto.ApiResponse;
import com.constructionrental.system.common.service.UploadService;
import com.constructionrental.system.equipment.dto.EquipmentCreateRequest;
import com.constructionrental.system.equipment.dto.EquipmentStatusUpdateRequest;
import com.constructionrental.system.equipment.dto.EquipmentUpdateRequest;
import com.constructionrental.system.equipment.dto.response.AvailableEquipmentResponse;
import com.constructionrental.system.equipment.dto.response.EquipmentResponse;
import com.constructionrental.system.equipment.service.EquipmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/equipment")
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final UploadService uploadService;
    private final com.constructionrental.system.maintenance.service.MaintenanceService maintenanceService;

    public EquipmentController(EquipmentService equipmentService,
                               UploadService uploadService,
                               com.constructionrental.system.maintenance.service.MaintenanceService maintenanceService) {
        this.equipmentService = equipmentService;
        this.uploadService = uploadService;
        this.maintenanceService = maintenanceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EquipmentResponse>>> getEquipmentList(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean active) {
        List<EquipmentResponse> equipment = equipmentService.getEquipmentList(
                search, categoryId, status, active);
        return ResponseEntity.ok(ApiResponse.success(equipment));
    }

    @GetMapping("/catalog")
    public ResponseEntity<ApiResponse<List<AvailableEquipmentResponse>>> getAvailableCatalog() {
        List<AvailableEquipmentResponse> catalog = equipmentService.getAvailableCatalog();
        return ResponseEntity.ok(ApiResponse.success(catalog));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentResponse>> getEquipmentById(@PathVariable Long id) {
        EquipmentResponse equipment = equipmentService.getEquipmentById(id);
        return ResponseEntity.ok(ApiResponse.success(equipment));
    }

    @GetMapping("/{id}/daily-rate")
    public ResponseEntity<ApiResponse<BigDecimal>> getEquipmentDailyRate(@PathVariable Long id) {
        BigDecimal dailyRate = equipmentService.getEquipmentDailyRate(id);
        return ResponseEntity.ok(ApiResponse.success(dailyRate));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> createEquipment(
            @Valid @RequestBody EquipmentCreateRequest request) {
        EquipmentResponse equipment = equipmentService.createEquipment(request);
        return new ResponseEntity<>(ApiResponse.success(equipment, "Equipment created successfully"), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> updateEquipment(
            @PathVariable Long id,
            @Valid @RequestBody EquipmentUpdateRequest request) {
        EquipmentResponse equipment = equipmentService.updateEquipment(id, request);
        return ResponseEntity.ok(ApiResponse.success(equipment, "Equipment updated successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> updateEquipmentStatus(
            @PathVariable Long id,
            @RequestBody EquipmentStatusUpdateRequest request) {
        EquipmentResponse equipment = equipmentService.updateStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success(equipment, "Equipment status updated successfully"));
    }

    @GetMapping("/{id}/maintenance")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<com.constructionrental.system.maintenance.dto.response.MaintenanceResponse>>> getEquipmentMaintenance(
            @PathVariable Long id) {
        List<com.constructionrental.system.maintenance.dto.response.MaintenanceResponse> history =
                maintenanceService.getMaintenanceByEquipment(id);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @PostMapping(value = "/upload-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<String>>> uploadImages(
            @RequestParam("files") List<MultipartFile> files) {
        List<String> storedUrls = uploadService.storeEquipmentImages(files);
        return ResponseEntity.ok(ApiResponse.success(storedUrls, "Equipment images uploaded successfully"));
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> uploadAndAddEquipmentImages(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "makePrimary", defaultValue = "false") Boolean makePrimary) {
        List<String> storedUrls = uploadService.storeEquipmentImages(files);
        EquipmentResponse response = equipmentService.addImagesToEquipment(id, storedUrls, makePrimary);
        return ResponseEntity.ok(ApiResponse.success(response, "Images attached to equipment successfully"));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> deleteEquipmentImage(
            @PathVariable Long id,
            @PathVariable Long imageId) {
        EquipmentResponse response = equipmentService.deleteEquipmentImage(id, imageId);
        return ResponseEntity.ok(ApiResponse.success(response, "Equipment image removed successfully"));
    }

    @PatchMapping("/{id}/images/{imageId}/primary")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> setPrimaryImage(
            @PathVariable Long id,
            @PathVariable Long imageId) {
        EquipmentResponse response = equipmentService.setPrimaryImage(id, imageId);
        return ResponseEntity.ok(ApiResponse.success(response, "Primary equipment image updated"));
    }
}
