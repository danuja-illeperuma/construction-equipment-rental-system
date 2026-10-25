package com.constructionrental.system.category.controller;

import com.constructionrental.system.category.dto.CategoryCreateRequest;
import com.constructionrental.system.category.dto.CategoryResponse;
import com.constructionrental.system.category.dto.CategoryStatusUpdateRequest;
import com.constructionrental.system.category.dto.CategoryUpdateRequest;
import com.constructionrental.system.category.service.CategoryService;
import com.constructionrental.system.common.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories(
            @RequestParam(required = false) Boolean active) {
        List<CategoryResponse> categories = categoryService.getAllCategories(active);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        CategoryResponse category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryCreateRequest request) {
        CategoryResponse category = categoryService.createCategory(request);
        return new ResponseEntity<>(ApiResponse.success(category, "Category created successfully"), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateRequest request) {
        CategoryResponse category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success(category, "Category updated successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategoryStatus(
            @PathVariable Long id,
            @Valid @RequestBody CategoryStatusUpdateRequest request) {
        CategoryResponse category = categoryService.updateStatus(id, request.getIsActive());
        return ResponseEntity.ok(ApiResponse.success(category, "Category status updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted successfully"));
    }
}
