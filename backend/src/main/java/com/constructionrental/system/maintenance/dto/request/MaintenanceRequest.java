package com.constructionrental.system.maintenance.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class MaintenanceRequest {

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    @NotBlank(message = "Maintenance type is required")
    @Pattern(regexp = "ROUTINE|REPAIR", message = "Maintenance type must be ROUTINE or REPAIR")
    private String maintenanceType;

    @NotBlank(message = "Description is required")
    @Size(max = 500)
    private String description;

    @DecimalMin(value = "0.0", message = "Maintenance cost must be non-negative")
    private BigDecimal maintenanceCost = BigDecimal.ZERO;

    @NotNull(message = "Maintenance date is required")
    private LocalDate maintenanceDate;

    private LocalDate nextMaintenanceDate;

    @Pattern(regexp = "PENDING|COMPLETED", message = "Status must be PENDING or COMPLETED")
    private String status = "PENDING";

    @Size(max = 500)
    private String notes;

    private Long customerId;

    private Boolean isPaid;

    public MaintenanceRequest() {}

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Boolean getIsPaid() {
        return isPaid;
    }

    public void setIsPaid(Boolean isPaid) {
        this.isPaid = isPaid;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getMaintenanceType() {
        return maintenanceType;
    }

    public void setMaintenanceType(String maintenanceType) {
        this.maintenanceType = maintenanceType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getMaintenanceCost() {
        return maintenanceCost;
    }

    public void setMaintenanceCost(BigDecimal maintenanceCost) {
        this.maintenanceCost = maintenanceCost;
    }

    public LocalDate getMaintenanceDate() {
        return maintenanceDate;
    }

    public void setMaintenanceDate(LocalDate maintenanceDate) {
        this.maintenanceDate = maintenanceDate;
    }

    public LocalDate getNextMaintenanceDate() {
        return nextMaintenanceDate;
    }

    public void setNextMaintenanceDate(LocalDate nextMaintenanceDate) {
        this.nextMaintenanceDate = nextMaintenanceDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
