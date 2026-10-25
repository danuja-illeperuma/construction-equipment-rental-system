package com.constructionrental.system.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CustomerRegisterRequest {

    @NotBlank(message = "Customer type is required")
    @Pattern(regexp = "^(INDIVIDUAL|CONTRACTOR|COMPANY)$", message = "Customer type must be INDIVIDUAL, CONTRACTOR, or COMPANY")
    private String customerType;

    @NotBlank(message = "Name is required")
    @Size(max = 150, message = "Name must not exceed 150 characters")
    private String name;

    @Size(max = 30, message = "NIC or BR number must not exceed 30 characters")
    private String nicOrBrNumber;

    @NotBlank(message = "Phone number is required")
    @Size(max = 15, message = "Phone number must not exceed 15 characters")
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    public CustomerRegisterRequest() {}

    public CustomerRegisterRequest(String customerType, String name, String nicOrBrNumber,
                                   String phone, String email, String password, String address) {
        this.customerType = customerType;
        this.name = name;
        this.nicOrBrNumber = nicOrBrNumber;
        this.phone = phone;
        this.email = email;
        this.password = password;
        this.address = address;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
