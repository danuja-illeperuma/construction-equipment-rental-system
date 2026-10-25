package com.constructionrental.system.returns.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class EquipmentReturnRequest {

    @NotNull(message = "Rental item ID is required")
    private Long rentalItemId;

    private LocalDateTime returnedAt;

    @NotNull(message = "Condition is required")
    @Pattern(regexp = "GOOD|DAMAGED", message = "Condition must be GOOD or DAMAGED")
    private String condition;

    @Size(max = 500)
    private String notes;

    public EquipmentReturnRequest() {}

    public Long getRentalItemId() {
        return rentalItemId;
    }

    public void setRentalItemId(Long rentalItemId) {
        this.rentalItemId = rentalItemId;
    }

    public LocalDateTime getReturnedAt() {
        return returnedAt != null ? returnedAt : LocalDateTime.now();
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
