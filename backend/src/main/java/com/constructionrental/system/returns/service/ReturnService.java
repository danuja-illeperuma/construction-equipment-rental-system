package com.constructionrental.system.returns.service;

import com.constructionrental.system.common.exception.ForbiddenException;
import com.constructionrental.system.common.exception.ResourceNotFoundException;
import com.constructionrental.system.rental.dto.response.RentalItemResponse;
import com.constructionrental.system.rental.repository.RentalItemRepository;
import com.constructionrental.system.rental.repository.RentalRepository;
import com.constructionrental.system.returns.dto.request.EquipmentReturnRequest;
import com.constructionrental.system.returns.dto.response.EquipmentReturnResponse;
import com.constructionrental.system.returns.repository.ReturnRepository;
import com.constructionrental.system.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReturnService {

    private final ReturnRepository returnRepository;
    private final RentalItemRepository rentalItemRepository;
    private final RentalRepository rentalRepository;

    public ReturnService(ReturnRepository returnRepository,
                         RentalItemRepository rentalItemRepository,
                         RentalRepository rentalRepository) {
        this.returnRepository = returnRepository;
        this.rentalItemRepository = rentalItemRepository;
        this.rentalRepository = rentalRepository;
    }

    public List<EquipmentReturnResponse> getAllReturns(UserPrincipal principal) {
        if (principal != null && principal.isCustomer()) {
            throw new ForbiddenException("Customers are not permitted to access equipment return logs");
        }
        return returnRepository.findAll();
    }

    public EquipmentReturnResponse getReturnById(Long id, UserPrincipal principal) {
        if (principal != null && principal.isCustomer()) {
            throw new ForbiddenException("Customers are not permitted to access equipment return details");
        }
        return returnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Return record not found with ID: " + id));
    }

    public List<EquipmentReturnResponse> getReturnsByRentalId(Long rentalId, UserPrincipal principal) {
        if (principal != null && principal.isCustomer()) {
            throw new ForbiddenException("Customers are not permitted to access equipment return details");
        }
        return returnRepository.findByRentalId(rentalId);
    }

    /**
     * Computes late penalty preview using scalar function calculate_late_charge.
     */
    public BigDecimal calculateLateCharge(Long rentalItemId, LocalDateTime returnedAt) {
        LocalDateTime effectiveTime = returnedAt != null ? returnedAt : LocalDateTime.now();
        return returnRepository.callCalculateLateCharge(rentalItemId, effectiveTime);
    }

    @Transactional
    public EquipmentReturnResponse recordReturn(EquipmentReturnRequest request, UserPrincipal principal) {
        if (principal != null && principal.isCustomer()) {
            throw new ForbiddenException("Customers are not permitted to process equipment returns");
        }

        RentalItemResponse rentalItem = rentalItemRepository.findById(request.getRentalItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Rental item not found with ID: " + request.getRentalItemId()));

        LocalDateTime returnedAt = request.getReturnedAt() != null ? request.getReturnedAt() : LocalDateTime.now();
        Long staffUserId = (principal != null && principal.getId() != null) ? principal.getId() : 1L;

        // Execute MySQL stored procedure sp_process_return
        Long returnId = returnRepository.callProcessReturn(
                rentalItem.getRentalItemId(),
                returnedAt,
                request.getCondition(),
                request.getNotes(),
                staffUserId
        );

        // Ensure rental status transitions to COMPLETED if all items have been returned
        if (returnRepository.countUnreturnedItems(rentalItem.getRentalId()) == 0) {
            rentalRepository.updateStatus(rentalItem.getRentalId(), "COMPLETED");
        }

        return getReturnById(returnId, principal);
    }
}
