package com.constructionrental.system.payment.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SuccessfulPaymentResponse {

    private Long paymentId;
    private String transactionReference;
    private String bookingReference;
    private String customerName;
    private BigDecimal amount;
    private String paymentMethod;
    private LocalDateTime paidAt;

    public SuccessfulPaymentResponse() {}

    public SuccessfulPaymentResponse(Long paymentId, String transactionReference, String bookingReference,
                                     String customerName, BigDecimal amount, String paymentMethod,
                                     LocalDateTime paidAt) {
        this.paymentId = paymentId;
        this.transactionReference = transactionReference;
        this.bookingReference = bookingReference;
        this.customerName = customerName;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.paidAt = paidAt;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
}
