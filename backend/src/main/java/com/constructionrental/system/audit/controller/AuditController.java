package com.constructionrental.system.audit.controller;

import com.constructionrental.system.audit.dto.response.AuditLogResponse;
import com.constructionrental.system.audit.service.AuditService;
import com.constructionrental.system.common.dto.ApiResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-logs")
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditLogs(
            @RequestParam(required = false) String tableName,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer limit) {
        List<AuditLogResponse> logs = auditService.getAuditLogs(tableName, action, userId, startDate, endDate, limit);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AuditLogResponse>> getAuditLogById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(auditService.getAuditLogById(id)));
    }
}
