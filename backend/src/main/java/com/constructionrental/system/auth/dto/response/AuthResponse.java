package com.constructionrental.system.auth.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private String tokenType = "Bearer";
    private Long id;
    private String name;
    private String email;
    private String role;
    private String accountType;

    @JsonProperty("isCustomer")
    private Boolean isCustomer;

    private String customerType;

    public AuthResponse() {}

    public AuthResponse(String token, Long id, String name, String email, String role, Boolean isCustomer) {
        this(token, id, name, email, role, Boolean.TRUE.equals(isCustomer) ? "CUSTOMER" : "USER", isCustomer, null);
    }

    public AuthResponse(String token, Long id, String name, String email, String role,
                        String accountType, Boolean isCustomer, String customerType) {
        this.token = token;
        this.type = "Bearer";
        this.tokenType = "Bearer";
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.accountType = accountType;
        this.isCustomer = isCustomer;
        this.customerType = customerType;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
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
    public Boolean getIsCustomer() {
        return isCustomer;
    }

    public void setIsCustomer(Boolean isCustomer) {
        this.isCustomer = isCustomer;
    }

    public String getCustomerType() {
        return customerType;
    }

    public void setCustomerType(String customerType) {
        this.customerType = customerType;
    }
}
