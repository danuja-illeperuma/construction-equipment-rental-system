package com.constructionrental.system.equipment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EquipmentStatusUpdateRequest {

    @JsonProperty("isActive")
    private Boolean isActive;

    @JsonProperty("status")
    private String status;

    public EquipmentStatusUpdateRequest() {}

    public EquipmentStatusUpdateRequest(Boolean isActive) {
        this.isActive = isActive;
    }

    public EquipmentStatusUpdateRequest(String status) {
        this.status = status;
    }

    public EquipmentStatusUpdateRequest(Boolean isActive, String status) {
        this.isActive = isActive;
        this.status = status;
    }

    @JsonProperty("isActive")
    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
