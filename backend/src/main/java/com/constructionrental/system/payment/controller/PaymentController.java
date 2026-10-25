package com.constructionrental.system.payment.controller;

import com.constructionrental.system.common.dto.ApiResponse;
import com.constructionrental.system.payment.dto.request.PaymentCreateRequest;
import com.constructionrental.system.payment.dto.request.SimulatePaymentRequest;
import com.constructionrental.system.payment.dto.response.PaymentResponse;
import com.constructionrental.system.payment.dto.response.SuccessfulPaymentResponse;
import com.constructionrental.system.payment.service.PaymentService;
import com.constructionrental.system.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Create payment for authenticated customer's own rental.
     * Restricted to authenticated customers only.
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> initiatePayment(
            @Valid @RequestBody PaymentCreateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        PaymentResponse response = paymentService.initiatePayment(request, principal);
        return new ResponseEntity<>(ApiResponse.success(response, "Payment initiated successfully with status PENDING"), HttpStatus.CREATED);
    }

    /**
     * Simulated payment by payment ID (defaults to SUCCESS, supports ?status=FAILED).
     * Restricted to authenticated customers only.
     */
    @PostMapping("/{id}/simulate")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> simulatePaymentById(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "SUCCESS") String status,
            @AuthenticationPrincipal UserPrincipal principal) {
        PaymentResponse response = paymentService.simulatePayment(id, status, principal);
        String msg = "SUCCESS".equalsIgnoreCase(response.getPaymentStatus())
                ? "Payment simulated successfully. Rental status is now CONFIRMED"
                : "Payment failure recorded successfully. Rental remains PENDING_PAYMENT";
        return ResponseEntity.ok(ApiResponse.success(response, msg));
    }

    /**
     * Simulated payment via request payload (supports rentalId, bookingReference, and status).
     * Restricted to authenticated customers only.
     */
    @PostMapping("/simulate")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> simulatePayment(
            @Valid @RequestBody SimulatePaymentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        PaymentResponse response = paymentService.simulatePayment(request, principal);
        String msg = "SUCCESS".equalsIgnoreCase(response.getPaymentStatus())
                ? "Payment simulated successfully. Rental status is now CONFIRMED"
                : "Payment failure recorded successfully. Rental remains PENDING_PAYMENT";
        return ResponseEntity.ok(ApiResponse.success(response, msg));
    }

    /**
     * Simulated payment by booking reference.
     * Restricted to authenticated customers only.
     */
    @PostMapping("/reference/{bookingReference}/simulate")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> simulatePaymentByBookingReference(
            @PathVariable String bookingReference,
            @RequestParam(required = false, defaultValue = "SUCCESS") String status,
            @AuthenticationPrincipal UserPrincipal principal) {
        PaymentResponse response = paymentService.simulatePaymentByBookingReference(bookingReference, status, principal);
        String msg = "SUCCESS".equalsIgnoreCase(response.getPaymentStatus())
                ? "Payment simulated successfully. Rental status is now CONFIRMED"
                : "Payment failure recorded successfully. Rental remains PENDING_PAYMENT";
        return ResponseEntity.ok(ApiResponse.success(response, msg));
    }

    /**
     * Get payment details by rental ID.
     */
    @GetMapping("/rental/{rentalId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByRentalId(
            @PathVariable Long rentalId,
            @AuthenticationPrincipal UserPrincipal principal) {
        PaymentResponse response = paymentService.getPaymentByRentalId(rentalId, principal);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get payment details by booking reference.
     */
    @GetMapping("/reference/{bookingReference}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByBookingReference(
            @PathVariable String bookingReference,
            @AuthenticationPrincipal UserPrincipal principal) {
        PaymentResponse response = paymentService.getPaymentByBookingReference(bookingReference, principal);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * PayHere Webhook (IPN notification).
     */
    @PostMapping("/payhere/notify")
    public ResponseEntity<String> handlePayHereNotification(@RequestParam Map<String, String> allParams) {
        paymentService.processPayHereNotification(allParams);
        return ResponseEntity.ok("OK");
    }

    /**
     * Customer's personal payment history.
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getMyPayments(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<PaymentResponse> response = paymentService.getMyPayments(principal);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get payment details by ID.
     * Customers may only view their own payment; Staff/Manager/Admin can view any.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        PaymentResponse response = paymentService.getPaymentById(id, principal);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Staff / Manager / Admin payment list with optional status filter.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments(
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<PaymentResponse> response = paymentService.getAllPayments(status, principal);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Finance ledger view showing confirmed payments with customer and booking identifiers
     * using MySQL View `view_successful_payments`.
     */
    @GetMapping({"/successful", "/ledger"})
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<SuccessfulPaymentResponse>>> getSuccessfulPayments(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<SuccessfulPaymentResponse> response = paymentService.getSuccessfulPayments(principal);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<String>> getPaymentStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        PaymentResponse response = paymentService.getPaymentById(id, principal);
        return ResponseEntity.ok(ApiResponse.success(response.getPaymentStatus()));
    }
}
