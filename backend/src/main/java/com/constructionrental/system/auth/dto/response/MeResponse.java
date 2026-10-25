package com.constructionrental.system.auth.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public class MeResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private String accountType; // "USER" or "CUSTOMER"

    @JsonProperty("isCustomer")
    private boolean isCustomer;

    private String customerType;
    private String phone;
    private String address;
    private String nicOrBrNumber;
    private LocalDateTime createdAt;

    public MeResponse() {}

    public MeResponse(Long id, String name, String email, String role, String accountType,
                      boolean isCustomer, String customerType, String phone,
                      String address, String nicOrBrNumber, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.accountType = accountType;
        this.isCustomer = isCustomer;
        this.customerType = customerType;
        this.phone = phone;
        this.address = address;
        this.nicOrBrNumber = nicOrBrNumber;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    @JsonProperty("isCustomer")
    public boolean isCustomer() {
        return isCustomer;
    }

    public void setCustomer(boolean customer) {
        isCustomer = customer;
    }

    public String getCustomerType() {
        return customerType;
    }

    public void setCustomerType(String customerType) {
        this.customerType = customerType;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getNicOrBrNumber() {
        return nicOrBrNumber;
    }

    public void setNicOrBrNumber(String nicOrBrNumber) {
        this.nicOrBrNumber = nicOrBrNumber;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
