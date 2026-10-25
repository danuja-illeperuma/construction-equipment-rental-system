package com.constructionrental.system.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CustomerProfileUpdateRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 150, message = "Name must not exceed 150 characters")
    private String name;

    @Size(max = 30, message = "NIC or BR number must not exceed 30 characters")
    private String nicOrBrNumber;

    @NotBlank(message = "Phone number is required")
    @Size(max = 15, message = "Phone number must not exceed 15 characters")
    private String phone;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    public CustomerProfileUpdateRequest() {}

    public CustomerProfileUpdateRequest(String name, String nicOrBrNumber, String phone, String address) {
        this.name = name;
        this.nicOrBrNumber = nicOrBrNumber;
        this.phone = phone;
        this.address = address;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
