package com.constructionrental.system.rental.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public class RentalCreateRequest {

    private Long customerId; // In case staff creates booking for a customer, or set from authenticated customer

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotEmpty(message = "At least one rental item is required")
    @Valid
    private List<RentalItemRequest> items;

    public RentalCreateRequest() {}

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
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

    public List<RentalItemRequest> getItems() {
        return items;
    }

    public void setItems(List<RentalItemRequest> items) {
        this.items = items;
    }
}
