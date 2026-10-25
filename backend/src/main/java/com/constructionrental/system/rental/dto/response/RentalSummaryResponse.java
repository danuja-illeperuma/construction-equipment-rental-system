package com.constructionrental.system.rental.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class RentalSummaryResponse {

    private Long rentalId;
    private String bookingReference;
    private Long customerId;
    private String customerName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalAmount;
    private String status;
    private int itemCount;
    private LocalDateTime createdAt;

    public RentalSummaryResponse() {}

    public RentalSummaryResponse(Long rentalId, String bookingReference, Long customerId,
                                 String customerName, LocalDate startDate, LocalDate endDate,
                                 BigDecimal totalAmount, String status, int itemCount,
                                 LocalDateTime createdAt) {
        this.rentalId = rentalId;
        this.bookingReference = bookingReference;
        this.customerId = customerId;
        this.customerName = customerName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalAmount = totalAmount;
        this.status = status;
        this.itemCount = itemCount;
        this.createdAt = createdAt;
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

    public int getItemCount() {
        return itemCount;
    }

    public void setItemCount(int itemCount) {
        this.itemCount = itemCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
