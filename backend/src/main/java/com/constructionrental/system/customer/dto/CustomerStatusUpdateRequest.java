package com.constructionrental.system.customer.dto;

import jakarta.validation.constraints.NotNull;

public class CustomerStatusUpdateRequest {

    @NotNull(message = "isActive flag is required")
    private Boolean isActive;

    public CustomerStatusUpdateRequest() {}

    public CustomerStatusUpdateRequest(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
