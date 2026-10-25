package com.constructionrental.system.maintenance.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MaintenanceResponse {
    private Long maintenanceId;
    private Long equipmentId;
    private String equipmentCode;
    private String equipmentName;
    private String maintenanceType;
    private String description;
    private BigDecimal maintenanceCost;
    private LocalDate maintenanceDate;
    private LocalDate nextMaintenanceDate;
    private String status;
    private String notes;
    private Long recordedBy;
    private String recordedByName;
    private LocalDateTime createdAt;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private Boolean isPaid;
    private LocalDateTime paidAt;

    public MaintenanceResponse() {}

    public MaintenanceResponse(Long maintenanceId, Long equipmentId, String equipmentCode, String equipmentName,
                               String maintenanceType, String description, BigDecimal maintenanceCost,
                               LocalDate maintenanceDate, LocalDate nextMaintenanceDate, String status,
                               String notes, Long recordedBy, String recordedByName, LocalDateTime createdAt) {
        this(maintenanceId, equipmentId, equipmentCode, equipmentName, maintenanceType, description, maintenanceCost,
             maintenanceDate, nextMaintenanceDate, status, notes, recordedBy, recordedByName, createdAt,
             null, null, null, null, null);
    }

    public MaintenanceResponse(Long maintenanceId, Long equipmentId, String equipmentCode, String equipmentName,
                               String maintenanceType, String description, BigDecimal maintenanceCost,
                               LocalDate maintenanceDate, LocalDate nextMaintenanceDate, String status,
                               String notes, Long recordedBy, String recordedByName, LocalDateTime createdAt,
                               Long customerId, String customerName, String customerPhone, Boolean isPaid, LocalDateTime paidAt) {
        this.maintenanceId = maintenanceId;
        this.equipmentId = equipmentId;
        this.equipmentCode = equipmentCode;
        this.equipmentName = equipmentName;
        this.maintenanceType = maintenanceType;
        this.description = description;
        this.maintenanceCost = maintenanceCost;
        this.maintenanceDate = maintenanceDate;
        this.nextMaintenanceDate = nextMaintenanceDate;
        this.status = status;
        this.notes = notes;
        this.recordedBy = recordedBy;
        this.recordedByName = recordedByName;
        this.createdAt = createdAt;
        this.customerId = customerId;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.isPaid = isPaid;
        this.paidAt = paidAt;
    }

    public Long getMaintenanceId() {
        return maintenanceId;
    }

    public void setMaintenanceId(Long maintenanceId) {
        this.maintenanceId = maintenanceId;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getEquipmentCode() {
        return equipmentCode;
    }

    public void setEquipmentCode(String equipmentCode) {
        this.equipmentCode = equipmentCode;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
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

    public Long getRecordedBy() {
        return recordedBy;
    }

    public void setRecordedBy(Long recordedBy) {
        this.recordedBy = recordedBy;
    }

    public String getRecordedByName() {
        return recordedByName;
    }

    public void setRecordedByName(String recordedByName) {
        this.recordedByName = recordedByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public Boolean getIsPaid() {
        return isPaid;
    }

    public void setIsPaid(Boolean isPaid) {
        this.isPaid = isPaid;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
}
