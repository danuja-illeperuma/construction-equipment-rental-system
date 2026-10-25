package com.constructionrental.system.rental.controller;

import com.constructionrental.system.common.dto.ApiResponse;
import com.constructionrental.system.rental.dto.request.AvailabilityRequest;
import com.constructionrental.system.rental.dto.request.QuotationRequest;
import com.constructionrental.system.rental.dto.request.RentalCreateRequest;
import com.constructionrental.system.rental.dto.request.RentalStatusUpdateRequest;
import com.constructionrental.system.rental.dto.response.ActiveRentalResponse;
import com.constructionrental.system.rental.dto.response.AvailabilityResponse;
import com.constructionrental.system.rental.dto.response.QuotationResponse;
import com.constructionrental.system.rental.dto.response.RentalResponse;
import com.constructionrental.system.rental.service.AvailabilityService;
import com.constructionrental.system.rental.service.RentalService;
import com.constructionrental.system.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rentals")
public class RentalController {

    private final RentalService rentalService;
    private final AvailabilityService availabilityService;

    public RentalController(RentalService rentalService, AvailabilityService availabilityService) {
        this.rentalService = rentalService;
        this.availabilityService = availabilityService;
    }

    /**
     * Checks equipment availability for a requested date range.
     * Accessible by all authenticated users.
     */
    @PostMapping({"/availability", "/check-availability"})
    public ResponseEntity<ApiResponse<AvailabilityResponse>> checkAvailability(
            @Valid @RequestBody AvailabilityRequest request) {
        AvailabilityResponse response = availabilityService.checkAvailability(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Calculates an authoritative rental quotation using database functions and checks availability.
     * Accessible by public visitors.
     */
    @PostMapping({"/quote", "/calculate-quote"})
    public ResponseEntity<ApiResponse<QuotationResponse>> calculateQuotation(
            @Valid @RequestBody QuotationRequest request) {
        QuotationResponse response = rentalService.calculateQuotation(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Creates a new rental booking in PENDING_PAYMENT status.
     * Customers cannot spoof customerId; Staff are blocked from creating bookings.
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<RentalResponse>> createRental(
            @Valid @RequestBody RentalCreateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        RentalResponse response = rentalService.createRental(request, principal);
        return new ResponseEntity<>(ApiResponse.success(response, "Rental booking created with status PENDING_PAYMENT"), HttpStatus.CREATED);
    }

    /**
     * Retrieves rental details by ID.
     * Customers may only access their own rentals. Staff, Managers, and Admins can access any.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<RentalResponse>> getRentalById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        RentalResponse response = rentalService.getRentalById(id, principal);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Retrieves rental details by booking reference.
     * Customers may only access their own rentals. Staff, Managers, and Admins can access any.
     */
    @GetMapping("/reference/{bookingReference}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<RentalResponse>> getRentalByBookingReference(
            @PathVariable String bookingReference,
            @AuthenticationPrincipal UserPrincipal principal) {
        RentalResponse response = rentalService.getRentalByBookingReference(bookingReference, principal);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Retrieves all rentals belonging to the authenticated customer.
     */
    @GetMapping({"/my", "/my-rentals"})
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<RentalResponse>>> getMyRentals(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<RentalResponse> rentals = rentalService.getMyRentals(principal);
        return ResponseEntity.ok(ApiResponse.success(rentals));
    }

    /**
     * Lists all rentals with optional status filter.
     * Strictly restricted to Staff, Managers, and Admins.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<RentalResponse>>> getAllRentals(
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<RentalResponse> rentals = rentalService.getAllRentals(status, principal);
        return ResponseEntity.ok(ApiResponse.success(rentals));
    }

    /**
     * Live operations board displaying current customer bookings in progress
     * using MySQL View `view_active_rentals`.
     */
    @GetMapping({"/active", "/operations-board"})
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ActiveRentalResponse>>> getActiveRentals(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ActiveRentalResponse> activeRentals = rentalService.getActiveRentals(principal);
        return ResponseEntity.ok(ApiResponse.success(activeRentals));
    }

    /**
     * Cancels an eligible rental (PENDING_PAYMENT or CONFIRMED).
     * Customers may only cancel their own rentals.
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<RentalResponse>> cancelRental(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        RentalResponse response = rentalService.cancelRental(id, principal);
        return ResponseEntity.ok(ApiResponse.success(response, "Rental has been cancelled successfully"));
    }

    /**
     * Internal operational status updates (e.g. pickup, completion).
     * Restricted to Staff, Managers, and Admins. Customers receive 403 Forbidden.
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<RentalResponse>> updateRentalStatus(
            @PathVariable Long id,
            @Valid @RequestBody RentalStatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        RentalResponse response = rentalService.updateRentalStatus(id, request.getStatus(), principal);
        return ResponseEntity.ok(ApiResponse.success(response, "Rental status updated to " + request.getStatus()));
    }

    /**
     * Dedicated pickup handover endpoint.
     * Transitions rental from CONFIRMED to ACTIVE and sets equipment to RENTED.
     */
    @PatchMapping("/{id}/pickup")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<RentalResponse>> recordPickup(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        RentalResponse response = rentalService.recordPickup(id, principal);
        return ResponseEntity.ok(ApiResponse.success(response, "Equipment pickup recorded. Rental is now ACTIVE"));
    }
}
