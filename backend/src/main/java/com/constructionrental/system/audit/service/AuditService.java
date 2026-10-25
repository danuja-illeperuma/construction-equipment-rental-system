package com.constructionrental.system.audit.service;

import com.constructionrental.system.audit.dto.response.AuditLogResponse;
import com.constructionrental.system.audit.repository.AuditRepository;
import com.constructionrental.system.common.exception.ResourceNotFoundException;
import com.constructionrental.system.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditRepository auditRepository;

    public AuditService(AuditRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    public List<AuditLogResponse> getAuditLogs(String tableName, String action, Long userId,
                                              LocalDate startDate, LocalDate endDate, Integer limit) {
        return auditRepository.findAll(tableName, action, userId, startDate, endDate, limit);
    }

    public AuditLogResponse getAuditLogById(Long id) {
        return auditRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit log not found with ID: " + id));
    }

    public void logAction(Long userId, String action, String tableName, Long recordId, String description) {
        try {
            Long effectiveUserId = userId != null ? userId : getCurrentUserId();
            auditRepository.logAction(effectiveUserId, action, tableName, recordId, description);
        } catch (Exception e) {
            log.error("Failed to write audit log for action: {} on table: {} record: {}", action, tableName, recordId, e);
        }
    }

    public void logAction(String action, String tableName, Long recordId, String description) {
        logAction(null, action, tableName, recordId, description);
    }

    private Long getCurrentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) {
                return up.getId();
            }
        } catch (Exception ignored) {}
        return 1L; // Fallback to system / admin user
    }
}
