package com.constructionrental.system.returns.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class EquipmentReturnResponse {
    private Long returnId;
    private Long rentalItemId;
    private Long rentalId;
    private String equipmentCode;
    private String equipmentName;
    private LocalDateTime returnedAt;
    private String condition;
    private BigDecimal lateCharge;
    private String notes;
    private Long recordedBy;
    private String recordedByName;
    private LocalDateTime createdAt;

    public EquipmentReturnResponse() {}

    public EquipmentReturnResponse(Long returnId, Long rentalItemId, Long rentalId, String equipmentCode,
                                   String equipmentName, LocalDateTime returnedAt, String condition,
                                   BigDecimal lateCharge, String notes, Long recordedBy,
                                   String recordedByName, LocalDateTime createdAt) {
        this.returnId = returnId;
        this.rentalItemId = rentalItemId;
        this.rentalId = rentalId;
        this.equipmentCode = equipmentCode;
        this.equipmentName = equipmentName;
        this.returnedAt = returnedAt;
        this.condition = condition;
        this.lateCharge = lateCharge;
        this.notes = notes;
        this.recordedBy = recordedBy;
        this.recordedByName = recordedByName;
        this.createdAt = createdAt;
    }

    public Long getReturnId() {
        return returnId;
    }

    public void setReturnId(Long returnId) {
        this.returnId = returnId;
    }

    public Long getRentalItemId() {
        return rentalItemId;
    }

    public void setRentalItemId(Long rentalItemId) {
        this.rentalItemId = rentalItemId;
    }

    public Long getRentalId() {
        return rentalId;
    }

    public void setRentalId(Long rentalId) {
        this.rentalId = rentalId;
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

    public LocalDateTime getReturnedAt() {
        return returnedAt;
    }

    public void setReturnedAt(LocalDateTime returnedAt) {
        this.returnedAt = returnedAt;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public BigDecimal getLateCharge() {
        return lateCharge;
    }

    public void setLateCharge(BigDecimal lateCharge) {
        this.lateCharge = lateCharge;
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
}
