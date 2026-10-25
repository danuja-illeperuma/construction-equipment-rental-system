package com.constructionrental.system.equipment.service;

import com.constructionrental.system.category.dto.CategoryResponse;
import com.constructionrental.system.category.repository.CategoryRepository;
import com.constructionrental.system.common.exception.BadRequestException;
import com.constructionrental.system.common.exception.DuplicateResourceException;
import com.constructionrental.system.common.exception.ResourceNotFoundException;
import com.constructionrental.system.equipment.dto.EquipmentCreateRequest;
import com.constructionrental.system.equipment.dto.EquipmentImageDto;
import com.constructionrental.system.equipment.dto.EquipmentStatusUpdateRequest;
import com.constructionrental.system.equipment.dto.EquipmentUpdateRequest;
import com.constructionrental.system.equipment.dto.response.AvailableEquipmentResponse;
import com.constructionrental.system.equipment.dto.response.EquipmentResponse;
import com.constructionrental.system.equipment.repository.EquipmentRepository;
import com.constructionrental.system.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final CategoryRepository categoryRepository;

    public EquipmentService(EquipmentRepository equipmentRepository,
                            CategoryRepository categoryRepository) {
        this.equipmentRepository = equipmentRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<EquipmentResponse> getEquipmentList(String search,
                                                    Long categoryId,
                                                    String status,
                                                    Boolean active) {
        // Customers are strictly prohibited from viewing inactive equipment
        Boolean effectiveActive = active;
        if (isCurrentUserCustomer()) {
            effectiveActive = true;
        }

        return equipmentRepository.findFiltered(search, categoryId, status, effectiveActive);
    }

    @Deprecated
    public List<EquipmentResponse> getEquipmentList(String search,
                                                    Long categoryId,
                                                    String status,
                                                    Boolean active,
                                                    Boolean operatorAvailable) {
        return getEquipmentList(search, categoryId, status, active);
    }

    public List<EquipmentResponse> getEquipmentList(UserPrincipal principal,
                                                    String search,
                                                    Long categoryId,
                                                    String status,
                                                    Boolean active) {
        return getEquipmentList(search, categoryId, status, active);
    }

    @Deprecated
    public List<EquipmentResponse> getEquipmentList(UserPrincipal principal,
                                                    String search,
                                                    Long categoryId,
                                                    String status,
                                                    Boolean active,
                                                    Boolean operatorAvailable) {
        return getEquipmentList(search, categoryId, status, active);
    }

    public EquipmentResponse getEquipmentById(Long id) {
        EquipmentResponse equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + id));

        // Inactive equipment is hidden from customer browsing
        if (isCurrentUserCustomer() && Boolean.FALSE.equals(equipment.getIsActive())) {
            throw new ResourceNotFoundException("Equipment not found with id: " + id);
        }

        // Attach gallery images
        List<EquipmentImageDto> images = equipmentRepository.findImagesByEquipmentId(id);
        equipment.setImages(images);
        if ((equipment.getPrimaryImageUrl() == null || equipment.getPrimaryImageUrl().isBlank()) && !images.isEmpty()) {
            equipment.setPrimaryImageUrl(images.get(0).getImageUrl());
        }

        return equipment;
    }

    public EquipmentResponse getEquipmentById(UserPrincipal principal, Long id) {
        return getEquipmentById(id);
    }

    public List<EquipmentResponse> getAllEquipment(Long categoryId, String status, String search) {
        return equipmentRepository.findAll(categoryId, status, search);
    }

    /**
     * Retrieves public available equipment catalog using the view `view_available_equipment`.
     */
    public List<AvailableEquipmentResponse> getAvailableCatalog() {
        return equipmentRepository.findAvailableCatalog();
    }

    /**
     * Retrieves daily rate for equipment using scalar function `fn_get_equipment_daily_rate`.
     */
    public BigDecimal getEquipmentDailyRate(Long equipmentId) {
        if (!equipmentRepository.existsById(equipmentId)) {
            throw new ResourceNotFoundException("Equipment not found with id: " + equipmentId);
        }
        return equipmentRepository.getEquipmentDailyRate(equipmentId);
    }

    @Transactional
    public EquipmentResponse createEquipment(EquipmentCreateRequest request) {
        // Validate Category
        CategoryResponse category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new BadRequestException("Category not found with id: " + request.getCategoryId()));

        if (Boolean.FALSE.equals(category.getIsActive())) {
            throw new BadRequestException("Cannot assign equipment to inactive category: " + category.getCategoryName());
        }

        // Validate Equipment Code Uniqueness
        String code = request.getEquipmentCode().trim();
        if (equipmentRepository.existsByEquipmentCode(code)) {
            throw new DuplicateResourceException("Equipment code already exists: " + code);
        }

        // Validate Non-Negative Rates
        validateRates(request.getHourlyRate(), request.getDailyRate(), request.getMonthlyRate());

        Long newId = equipmentRepository.save(request);

        // Save multiple gallery images if provided
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                String imgUrl = request.getImageUrls().get(i);
                if (imgUrl != null && !imgUrl.isBlank()) {
                    boolean isPrimary = (request.getPrimaryImageUrl() != null && request.getPrimaryImageUrl().equalsIgnoreCase(imgUrl))
                            || (request.getPrimaryImageUrl() == null && i == 0);
                    equipmentRepository.saveEquipmentImage(newId, imgUrl.trim(), isPrimary, i);
                }
            }
            if (request.getPrimaryImageUrl() == null || request.getPrimaryImageUrl().isBlank()) {
                equipmentRepository.updatePrimaryImageUrl(newId, request.getImageUrls().get(0).trim());
            }
        } else if (request.getPrimaryImageUrl() != null && !request.getPrimaryImageUrl().isBlank()) {
            equipmentRepository.saveEquipmentImage(newId, request.getPrimaryImageUrl().trim(), true, 0);
        }

        return getEquipmentById(newId);
    }

    @Transactional
    public EquipmentResponse updateEquipment(Long id, EquipmentUpdateRequest request) {
        getEquipmentById(id); // Ensure exists

        // Validate Category
        CategoryResponse category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new BadRequestException("Category not found with id: " + request.getCategoryId()));

        if (Boolean.FALSE.equals(category.getIsActive())) {
            throw new BadRequestException("Cannot assign equipment to inactive category: " + category.getCategoryName());
        }

        // Validate Equipment Code Uniqueness
        String code = request.getEquipmentCode().trim();
        if (equipmentRepository.existsByEquipmentCodeAndNotId(code, id)) {
            throw new DuplicateResourceException("Equipment code already exists: " + code);
        }

        // Validate Non-Negative Rates
        validateRates(request.getHourlyRate(), request.getDailyRate(), request.getMonthlyRate());

        equipmentRepository.update(id, request);

        // Sync gallery images if provided
        if (request.getImageUrls() != null) {
            equipmentRepository.deleteImagesByEquipmentId(id);
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                String imgUrl = request.getImageUrls().get(i);
                if (imgUrl != null && !imgUrl.isBlank()) {
                    boolean isPrimary = (request.getPrimaryImageUrl() != null && request.getPrimaryImageUrl().equalsIgnoreCase(imgUrl))
                            || (request.getPrimaryImageUrl() == null && i == 0);
                    equipmentRepository.saveEquipmentImage(id, imgUrl.trim(), isPrimary, i);
                }
            }
            if ((request.getPrimaryImageUrl() == null || request.getPrimaryImageUrl().isBlank()) && !request.getImageUrls().isEmpty()) {
                equipmentRepository.updatePrimaryImageUrl(id, request.getImageUrls().get(0).trim());
            }
        } else if (request.getPrimaryImageUrl() != null && !request.getPrimaryImageUrl().isBlank()) {
            List<EquipmentImageDto> existing = equipmentRepository.findImagesByEquipmentId(id);
            if (existing.isEmpty()) {
                equipmentRepository.saveEquipmentImage(id, request.getPrimaryImageUrl().trim(), true, 0);
            }
        }

        return getEquipmentById(id);
    }

    @Transactional
    public EquipmentResponse addImagesToEquipment(Long id, List<String> imageUrls, Boolean makeFirstPrimary) {
        getEquipmentById(id);
        if (imageUrls != null && !imageUrls.isEmpty()) {
            List<EquipmentImageDto> existing = equipmentRepository.findImagesByEquipmentId(id);
            int startOrder = existing.size();

            for (int i = 0; i < imageUrls.size(); i++) {
                String url = imageUrls.get(i);
                if (url != null && !url.isBlank()) {
                    boolean isPrimary = (Boolean.TRUE.equals(makeFirstPrimary) && i == 0) || (existing.isEmpty() && i == 0);
                    equipmentRepository.saveEquipmentImage(id, url.trim(), isPrimary, startOrder + i);
                    if (isPrimary) {
                        equipmentRepository.updatePrimaryImageUrl(id, url.trim());
                    }
                }
            }
        }
        return getEquipmentById(id);
    }

    @Transactional
    public EquipmentResponse deleteEquipmentImage(Long equipmentId, Long imageId) {
        getEquipmentById(equipmentId);
        equipmentRepository.deleteEquipmentImage(imageId);

        // Re-evaluate primary image if needed
        List<EquipmentImageDto> remaining = equipmentRepository.findImagesByEquipmentId(equipmentId);
        if (remaining.isEmpty()) {
            equipmentRepository.updatePrimaryImageUrl(equipmentId, null);
        } else {
            boolean hasPrimary = remaining.stream().anyMatch(EquipmentImageDto::getIsPrimary);
            if (!hasPrimary) {
                Long newPrimaryId = remaining.get(0).getImageId();
                equipmentRepository.setPrimaryImage(equipmentId, newPrimaryId);
                equipmentRepository.updatePrimaryImageUrl(equipmentId, remaining.get(0).getImageUrl());
            }
        }

        return getEquipmentById(equipmentId);
    }

    @Transactional
    public EquipmentResponse setPrimaryImage(Long equipmentId, Long imageId) {
        getEquipmentById(equipmentId);
        equipmentRepository.findImageById(imageId).ifPresent(img -> {
            equipmentRepository.setPrimaryImage(equipmentId, imageId);
            equipmentRepository.updatePrimaryImageUrl(equipmentId, img.getImageUrl());
        });
        return getEquipmentById(equipmentId);
    }

    @Transactional
    public EquipmentResponse updateStatus(Long id, boolean isActive) {
        getEquipmentById(id); // Ensure exists

        equipmentRepository.updateActiveStatus(id, isActive);
        return getEquipmentById(id);
    }

    @Transactional
    public EquipmentResponse updateOperationalStatus(Long id, String status) {
        getEquipmentById(id); // Ensure exists

        equipmentRepository.updateStatus(id, status);
        return getEquipmentById(id);
    }

    @Transactional
    public EquipmentResponse updateStatus(Long id, EquipmentStatusUpdateRequest request) {
        getEquipmentById(id); // Ensure exists

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            equipmentRepository.updateStatus(id, request.getStatus());
        }
        if (request.getIsActive() != null) {
            equipmentRepository.updateActiveStatus(id, request.getIsActive());
        }
        return getEquipmentById(id);
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

    private void validateRates(BigDecimal hourly, BigDecimal daily, BigDecimal monthly) {
        if (hourly != null && hourly.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Hourly rate cannot be negative");
        }
        if (daily != null && daily.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Daily rate cannot be negative");
        }
        if (monthly != null && monthly.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Monthly rate cannot be negative");
        }
    }
}
