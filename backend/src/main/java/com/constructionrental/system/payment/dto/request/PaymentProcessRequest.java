package com.constructionrental.system.payment.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class PaymentProcessRequest {

    @NotNull(message = "Payment status is required")
    @Pattern(regexp = "SUCCESS|FAILED|EXPIRED", message = "Status must be SUCCESS, FAILED, or EXPIRED")
    private String paymentStatus;

    private String transactionReference;

    public PaymentProcessRequest() {}

    public PaymentProcessRequest(String paymentStatus, String transactionReference) {
        this.paymentStatus = paymentStatus;
        this.transactionReference = transactionReference;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }
}
