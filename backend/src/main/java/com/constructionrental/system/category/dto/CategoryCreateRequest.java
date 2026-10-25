package com.constructionrental.system.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CategoryCreateRequest {

    @NotBlank(message = "Category name is required")
    @Size(max = 100, message = "Category name must not exceed 100 characters")
    private String categoryName;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    public CategoryCreateRequest() {}

    public CategoryCreateRequest(String categoryName, String description) {
        this.categoryName = categoryName;
        this.description = description;
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
}
