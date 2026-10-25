package com.constructionrental.system.rental.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public class AvailabilityCheckRequest {

    @NotEmpty(message = "At least one equipment ID is required")
    private List<Long> equipmentIds;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    public AvailabilityCheckRequest() {}

    public AvailabilityCheckRequest(List<Long> equipmentIds, LocalDate startDate, LocalDate endDate) {
        this.equipmentIds = equipmentIds;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public List<Long> getEquipmentIds() {
        return equipmentIds;
    }

    public void setEquipmentIds(List<Long> equipmentIds) {
        this.equipmentIds = equipmentIds;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
}
