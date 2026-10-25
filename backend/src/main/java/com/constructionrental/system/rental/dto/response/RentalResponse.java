package com.constructionrental.system.rental.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class RentalResponse {
    private Long rentalId;
    private String bookingReference;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime paymentDeadline;
    private LocalDateTime pickupAt;
    private LocalDateTime createdAt;
    private String paymentStatus;
    private List<RentalItemResponse> items = new ArrayList<>();

    public RentalResponse() {}

    public RentalResponse(Long rentalId, String bookingReference, Long customerId, String customerName,
                          String customerPhone, LocalDate startDate, LocalDate endDate, BigDecimal totalAmount,
                          String status, LocalDateTime paymentDeadline, LocalDateTime pickupAt,
                          LocalDateTime createdAt, String paymentStatus) {
        this.rentalId = rentalId;
        this.bookingReference = bookingReference;
        this.customerId = customerId;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalAmount = totalAmount;
        this.status = status;
        this.paymentDeadline = paymentDeadline;
        this.pickupAt = pickupAt;
        this.createdAt = createdAt;
        this.paymentStatus = paymentStatus;
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

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getPaymentDeadline() {
        return paymentDeadline;
    }

    public void setPaymentDeadline(LocalDateTime paymentDeadline) {
        this.paymentDeadline = paymentDeadline;
    }

    public LocalDateTime getPickupAt() {
        return pickupAt;
    }

    public void setPickupAt(LocalDateTime pickupAt) {
        this.pickupAt = pickupAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public List<RentalItemResponse> getItems() {
        return items;
    }

    public void setItems(List<RentalItemResponse> items) {
        this.items = items;
    }
}
