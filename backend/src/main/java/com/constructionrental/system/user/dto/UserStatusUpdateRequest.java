package com.constructionrental.system.user.dto;

import jakarta.validation.constraints.NotNull;

public class UserStatusUpdateRequest {

    @NotNull(message = "isActive flag is required")
    private Boolean isActive;

    public UserStatusUpdateRequest() {}

    public UserStatusUpdateRequest(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
