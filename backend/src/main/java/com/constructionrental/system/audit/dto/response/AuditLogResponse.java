package com.constructionrental.system.audit.dto.response;

import java.time.LocalDateTime;

public class AuditLogResponse {
    private Long auditId;
    private Long userId;
    private String userName;
    private String action;
    private String tableName;
    private Long recordId;
    private String description;
    private LocalDateTime createdAt;

    public AuditLogResponse() {}

    public AuditLogResponse(Long auditId, Long userId, String userName, String action,
                            String tableName, Long recordId, String description, LocalDateTime createdAt) {
        this.auditId = auditId;
        this.userId = userId;
        this.userName = userName;
        this.action = action;
        this.tableName = tableName;
        this.recordId = recordId;
        this.description = description;
        this.createdAt = createdAt;
    }

    public Long getAuditId() {
        return auditId;
    }

    public void setAuditId(Long auditId) {
        this.auditId = auditId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public Long getRecordId() {
        return recordId;
    }

    public void setRecordId(Long recordId) {
        this.recordId = recordId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
