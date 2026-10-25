package com.constructionrental.system.category.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CategoryResponse {

    private Long categoryId;
    private String categoryName;
    private String description;

    @JsonProperty("isActive")
    private Boolean isActive;

    public CategoryResponse() {}

    public CategoryResponse(Long categoryId, String categoryName, String description, Boolean isActive) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.description = description;
        this.isActive = isActive;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @JsonProperty("isActive")
    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
