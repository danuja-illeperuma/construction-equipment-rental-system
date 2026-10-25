package com.constructionrental.system.customer.repository;

import java.time.LocalDateTime;

/**
 * Internal repository model that includes password_hash strictly for authentication.
 * This class is never returned to the controller or frontend.
 */
public class CustomerSecurityModel {
    private Long customerId;
    private String customerType;
    private String name;
    private String nicOrBrNumber;
    private String phone;
    private String email;
    private String passwordHash;
    private String address;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public CustomerSecurityModel() {}

    public CustomerSecurityModel(Long customerId, String customerType, String name, String nicOrBrNumber,
                                 String phone, String email, String passwordHash, String address,
                                 Boolean isActive, LocalDateTime createdAt) {
        this.customerId = customerId;
        this.customerType = customerType;
        this.name = name;
        this.nicOrBrNumber = nicOrBrNumber;
        this.phone = phone;
        this.email = email;
        this.passwordHash = passwordHash;
        this.address = address;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerType() {
        return customerType;
    }

    public void setCustomerType(String customerType) {
        this.customerType = customerType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNicOrBrNumber() {
        return nicOrBrNumber;
    }

    public void setNicOrBrNumber(String nicOrBrNumber) {
        this.nicOrBrNumber = nicOrBrNumber;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
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
