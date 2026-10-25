package com.constructionrental.system.returns.service;

import com.constructionrental.system.common.exception.BadRequestException;
import com.constructionrental.system.common.exception.ForbiddenException;
import com.constructionrental.system.common.exception.ResourceNotFoundException;
import com.constructionrental.system.returns.dto.request.DamageReportRequest;
import com.constructionrental.system.returns.dto.response.DamageReportResponse;
import com.constructionrental.system.returns.dto.response.EquipmentReturnResponse;
import com.constructionrental.system.returns.repository.DamageReportRepository;
import com.constructionrental.system.returns.repository.ReturnRepository;
import com.constructionrental.system.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DamageReportService {

    private final DamageReportRepository damageReportRepository;
    private final ReturnRepository returnRepository;

    public DamageReportService(DamageReportRepository damageReportRepository, ReturnRepository returnRepository) {
        this.damageReportRepository = damageReportRepository;
        this.returnRepository = returnRepository;
    }

    public List<DamageReportResponse> getAllDamageReports(UserPrincipal principal) {
        if (principal != null && principal.isCustomer()) {
            throw new ForbiddenException("Customers are not permitted to access damage reports");
        }
        return damageReportRepository.findAll();
    }

    public DamageReportResponse getDamageReportById(Long id, UserPrincipal principal) {
        if (principal != null && principal.isCustomer()) {
            throw new ForbiddenException("Customers are not permitted to access damage reports");
        }
        return damageReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Damage report not found with ID: " + id));
    }

    public List<DamageReportResponse> getDamageReportsByReturnId(Long returnId, UserPrincipal principal) {
        if (principal != null && principal.isCustomer()) {
            throw new ForbiddenException("Customers are not permitted to access damage reports");
        }
        return damageReportRepository.findByReturnId(returnId);
    }

    @Transactional
    public DamageReportResponse createDamageReport(DamageReportRequest request, UserPrincipal principal) {
        if (principal != null && principal.isCustomer()) {
            throw new ForbiddenException("Customers are not permitted to submit damage reports");
        }

        EquipmentReturnResponse returnRecord = returnRepository.findById(request.getReturnId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment return record not found with ID: " + request.getReturnId()));

        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new BadRequestException("Damage description cannot be empty");
        }

        Long staffUserId = (principal != null && principal.getId() != null) ? principal.getId() : 1L;

        // Execute MySQL stored procedure sp_record_damage
        Long damageId = damageReportRepository.callRecordDamage(
                returnRecord.getReturnId(),
                request.getDescription().trim(),
                request.getDamageCharge(),
                staffUserId
        );

        return getDamageReportById(damageId, principal);
    }
}
