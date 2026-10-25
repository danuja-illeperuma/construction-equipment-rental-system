package com.constructionrental.system.rental.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ActiveRentalResponse {

    private Long rentalId;
    private String bookingReference;
    private String customerName;
    private String customerPhone;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalAmount;
    private String status;

    public ActiveRentalResponse() {}

    public ActiveRentalResponse(Long rentalId, String bookingReference, String customerName,
                                String customerPhone, LocalDate startDate, LocalDate endDate,
                                BigDecimal totalAmount, String status) {
        this.rentalId = rentalId;
        this.bookingReference = bookingReference;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalAmount = totalAmount;
        this.status = status;
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
}
