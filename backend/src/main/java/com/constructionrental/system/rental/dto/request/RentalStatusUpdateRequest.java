package com.constructionrental.system.rental.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class RentalStatusUpdateRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "CONFIRMED|ACTIVE|COMPLETED|CANCELLED|EXPIRED", message = "Invalid status. Allowed values: CONFIRMED, ACTIVE, COMPLETED, CANCELLED, EXPIRED")
    private String status;

    public RentalStatusUpdateRequest() {}

    public RentalStatusUpdateRequest(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
