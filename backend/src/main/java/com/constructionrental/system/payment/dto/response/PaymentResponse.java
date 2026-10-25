package com.constructionrental.system.payment.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentResponse {
    private Long paymentId;
    private Long rentalId;
    private Long customerId;
    private String bookingReference;
    private BigDecimal amount;
    private String paymentMethod;
    private String paymentStatus;
    private String transactionReference;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
    private String rentalStatus;

    public PaymentResponse() {}

    public PaymentResponse(Long paymentId, Long rentalId, String bookingReference, BigDecimal amount,
                           String paymentMethod, String paymentStatus, String transactionReference,
                           LocalDateTime paidAt, LocalDateTime createdAt) {
        this(paymentId, rentalId, null, bookingReference, amount, paymentMethod, paymentStatus, transactionReference, paidAt, createdAt, null);
    }

    public PaymentResponse(Long paymentId, Long rentalId, Long customerId, String bookingReference, BigDecimal amount,
                           String paymentMethod, String paymentStatus, String transactionReference,
                           LocalDateTime paidAt, LocalDateTime createdAt) {
        this(paymentId, rentalId, customerId, bookingReference, amount, paymentMethod, paymentStatus, transactionReference, paidAt, createdAt, null);
    }

    public PaymentResponse(Long paymentId, Long rentalId, Long customerId, String bookingReference, BigDecimal amount,
                           String paymentMethod, String paymentStatus, String transactionReference,
                           LocalDateTime paidAt, LocalDateTime createdAt, String rentalStatus) {
        this.paymentId = paymentId;
        this.rentalId = rentalId;
        this.customerId = customerId;
        this.bookingReference = bookingReference;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.transactionReference = transactionReference;
        this.paidAt = paidAt;
        this.createdAt = createdAt;
        this.rentalStatus = rentalStatus;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public Long getRentalId() {
        return rentalId;
    }

    public void setRentalId(Long rentalId) {
        this.rentalId = rentalId;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
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

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getRentalStatus() {
        return rentalStatus;
    }

    public void setRentalStatus(String rentalStatus) {
        this.rentalStatus = rentalStatus;
    }
}
