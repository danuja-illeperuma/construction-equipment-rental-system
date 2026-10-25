package com.constructionrental.system.payment.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class PaymentCreateRequest {

    @NotNull(message = "Rental ID is required")
    private Long rentalId;

    @NotNull(message = "Payment method is required")
    @Pattern(regexp = "PAYHERE|SIMULATED", message = "Payment method must be PAYHERE or SIMULATED")
    private String paymentMethod;

    public PaymentCreateRequest() {}

    public Long getRentalId() {
        return rentalId;
    }

    public void setRentalId(Long rentalId) {
        this.rentalId = rentalId;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
