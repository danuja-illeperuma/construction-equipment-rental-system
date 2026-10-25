package com.constructionrental.system.category.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

public class CategoryStatusUpdateRequest {

    @NotNull(message = "isActive flag is required")
    @JsonProperty("isActive")
    private Boolean isActive;

    public CategoryStatusUpdateRequest() {}

    public CategoryStatusUpdateRequest(Boolean isActive) {
        this.isActive = isActive;
    }

    @JsonProperty("isActive")
    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
