package com.constructionrental.system.rental.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class AvailabilityRequest {

    private Long equipmentId;
    private List<Long> equipmentIds;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private Long excludeRentalId;

    public AvailabilityRequest() {}

    public AvailabilityRequest(Long equipmentId, LocalDate startDate, LocalDate endDate) {
        this.equipmentId = equipmentId;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public AvailabilityRequest(List<Long> equipmentIds, LocalDate startDate, LocalDate endDate) {
        this.equipmentIds = equipmentIds;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public List<Long> getEquipmentIds() {
        if (equipmentIds != null && !equipmentIds.isEmpty()) {
            return equipmentIds;
        }
        if (equipmentId != null) {
            return List.of(equipmentId);
        }
        return new ArrayList<>();
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

    public Long getExcludeRentalId() {
        return excludeRentalId;
    }

    public void setExcludeRentalId(Long excludeRentalId) {
        this.excludeRentalId = excludeRentalId;
    }
}
