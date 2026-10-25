package com.constructionrental.system.rental.dto.response;

import java.util.List;

public class AvailabilityResponse {
    private boolean isAvailable;
    private List<Long> conflictingEquipmentIds;
    private String message;

    public AvailabilityResponse() {}

    public AvailabilityResponse(boolean isAvailable, List<Long> conflictingEquipmentIds, String message) {
        this.isAvailable = isAvailable;
        this.conflictingEquipmentIds = conflictingEquipmentIds;
        this.message = message;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }

    public List<Long> getConflictingEquipmentIds() {
        return conflictingEquipmentIds;
    }

    public void setConflictingEquipmentIds(List<Long> conflictingEquipmentIds) {
        this.conflictingEquipmentIds = conflictingEquipmentIds;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
