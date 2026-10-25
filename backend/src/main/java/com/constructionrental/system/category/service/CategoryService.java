package com.constructionrental.system.category.service;

import com.constructionrental.system.category.dto.CategoryCreateRequest;
import com.constructionrental.system.category.dto.CategoryResponse;
import com.constructionrental.system.category.dto.CategoryUpdateRequest;
import com.constructionrental.system.category.repository.CategoryRepository;
import com.constructionrental.system.common.exception.DuplicateResourceException;
import com.constructionrental.system.common.exception.ResourceNotFoundException;
import com.constructionrental.system.common.exception.BadRequestException;
import org.springframework.dao.DataIntegrityViolationException;
import com.constructionrental.system.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service("featureCategoryService")
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getAllCategories(Boolean activeOnly) {
        boolean filterActive = Boolean.TRUE.equals(activeOnly) || isCurrentUserCustomer();
        if (filterActive) {
            return categoryRepository.findActive();
        }
        return categoryRepository.findAll();
    }

    public CategoryResponse getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    @Transactional
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        String categoryName = request.getCategoryName().trim();
        if (categoryRepository.existsByName(categoryName)) {
            throw new DuplicateResourceException("Category name already exists: " + categoryName);
        }

        Long newId = categoryRepository.save(request);
        return getCategoryById(newId);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryUpdateRequest request) {
        getCategoryById(id); // Ensure exists

        String categoryName = request.getCategoryName().trim();
        if (categoryRepository.existsByNameAndNotId(categoryName, id)) {
            throw new DuplicateResourceException("Category name already exists: " + categoryName);
        }

        categoryRepository.update(id, request);
        return getCategoryById(id);
    }

    @Transactional
    public CategoryResponse updateStatus(Long id, boolean isActive) {
        getCategoryById(id); // Ensure exists

        categoryRepository.updateActiveStatus(id, isActive);
        return getCategoryById(id);
    }

    @Transactional
    public void deleteCategory(Long id) {
        getCategoryById(id); // Ensure exists
        try {
            categoryRepository.delete(id);
        } catch (org.springframework.dao.DataAccessException e) {
            if (e instanceof org.springframework.dao.DataIntegrityViolationException || 
                (e.getMessage() != null && e.getMessage().toLowerCase().contains("constraint"))) {
                throw new BadRequestException("Cannot delete category because its equipment has associated rental or service records. Deactivate the category instead.");
            }
            throw e; // rethrow if it's a connection issue etc.
        }
    }

    private boolean isCurrentUserCustomer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        if (auth.getPrincipal() instanceof UserPrincipal up) {
            return up.isCustomer();
        }
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_CUSTOMER".equals(a.getAuthority()) || "CUSTOMER".equals(a.getAuthority()));
    }
}
