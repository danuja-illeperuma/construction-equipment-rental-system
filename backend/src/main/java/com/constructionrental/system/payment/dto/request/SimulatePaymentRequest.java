package com.constructionrental.system.payment.dto.request;

public class SimulatePaymentRequest {

    private Long rentalId;
    private String bookingReference;
    private String status = "SUCCESS";

    public SimulatePaymentRequest() {}

    public SimulatePaymentRequest(Long rentalId) {
        this.rentalId = rentalId;
        this.status = "SUCCESS";
    }

    public SimulatePaymentRequest(Long rentalId, String status) {
        this.rentalId = rentalId;
        this.status = status;
    }

    public SimulatePaymentRequest(String bookingReference, String status) {
        this.bookingReference = bookingReference;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
