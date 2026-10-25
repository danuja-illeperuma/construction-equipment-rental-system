package com.constructionrental.system.user.dto;

import java.time.LocalDateTime;

public class InternalUserResponse {
    private Long userId;
    private String fullName;
    private String email;
    private String role;
    private String phone;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public InternalUserResponse() {}

    public InternalUserResponse(Long userId, String fullName, String email, String role,
                                String phone, Boolean isActive, LocalDateTime createdAt) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.phone = phone;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
