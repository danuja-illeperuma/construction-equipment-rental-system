package com.constructionrental.system.rental.service;

import com.constructionrental.system.common.exception.BadRequestException;
import com.constructionrental.system.common.exception.ConflictException;
import com.constructionrental.system.common.exception.ForbiddenException;
import com.constructionrental.system.common.exception.ResourceNotFoundException;
import com.constructionrental.system.equipment.dto.response.EquipmentResponse;
import com.constructionrental.system.equipment.repository.EquipmentRepository;
import com.constructionrental.system.rental.dto.request.AvailabilityRequest;
import com.constructionrental.system.rental.dto.request.QuotationRequest;
import com.constructionrental.system.rental.dto.request.RentalCreateRequest;
import com.constructionrental.system.rental.dto.request.RentalItemRequest;
import com.constructionrental.system.rental.dto.response.ActiveRentalResponse;
import com.constructionrental.system.rental.dto.response.AvailabilityResponse;
import com.constructionrental.system.rental.dto.response.QuotationResponse;
import com.constructionrental.system.rental.dto.response.RentalItemResponse;
import com.constructionrental.system.rental.dto.response.RentalResponse;
import com.constructionrental.system.rental.repository.RentalItemRepository;
import com.constructionrental.system.rental.repository.RentalRepository;
import com.constructionrental.system.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class RentalService {

    private static final Logger log = LoggerFactory.getLogger(RentalService.class);

    private final RentalRepository rentalRepository;
    private final RentalItemRepository rentalItemRepository;
    private final EquipmentRepository equipmentRepository;
    private final AvailabilityService availabilityService;
    private final com.constructionrental.system.maintenance.repository.MaintenanceRepository maintenanceRepository;
    private final JdbcTemplate jdbcTemplate;

    public RentalService(RentalRepository rentalRepository,
                         RentalItemRepository rentalItemRepository,
                         EquipmentRepository equipmentRepository,
                         AvailabilityService availabilityService,
                         com.constructionrental.system.maintenance.repository.MaintenanceRepository maintenanceRepository,
                         JdbcTemplate jdbcTemplate) {
        this.rentalRepository = rentalRepository;
        this.rentalItemRepository = rentalItemRepository;
        this.equipmentRepository = equipmentRepository;
        this.availabilityService = availabilityService;
        this.maintenanceRepository = maintenanceRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public AvailabilityResponse checkAvailability(AvailabilityRequest request) {
        return availabilityService.checkAvailability(request);
    }

    /**
     * Calculates an authoritative rental quotation using database functions and checks availability.
     * Does not reserve equipment or create a database rental record.
     */
    public QuotationResponse calculateQuotation(QuotationRequest request) {
        if (request.getEquipmentId() == null) {
            throw new BadRequestException("Equipment ID is required");
        }
        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new BadRequestException("Start date and end date are required");
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }
        if (request.getRentalType() == null || request.getRentalType().isBlank()) {
            throw new BadRequestException("Rental type is required");
        }

        String type = request.getRentalType().trim().toUpperCase();
        if (!List.of("HOURLY", "DAILY", "MONTHLY").contains(type)) {
            throw new BadRequestException("Invalid rental type. Must be HOURLY, DAILY, or MONTHLY");
        }

        int quantity = (request.getQuantity() != null && request.getQuantity() > 0) ? request.getQuantity() : 1;

        EquipmentResponse equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + request.getEquipmentId()));

        if (equipment.getIsActive() != null && !equipment.getIsActive()) {
            throw new BadRequestException("Equipment " + equipment.getEquipmentName() + " is inactive");
        }

        BigDecimal unitRate = resolveUnitRate(equipment, type);
        if (unitRate == null || unitRate.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Rate not configured for rental type " + type + " on equipment: " + equipment.getEquipmentName());
        }

        BigDecimal duration;
        String durationLabel;

        if ("HOURLY".equals(type)) {
            if (!request.getStartDate().isEqual(request.getEndDate())) {
                throw new BadRequestException("Hourly rental must have the same start and end date");
            }
            if (request.getDuration() != null && request.getDuration().compareTo(BigDecimal.ZERO) > 0) {
                duration = request.getDuration();
            } else {
                duration = new BigDecimal("8.00");
            }
            durationLabel = duration.stripTrailingZeros().toPlainString() + " Hour" + (duration.compareTo(BigDecimal.ONE) > 0 ? "s" : "");
        } else if ("DAILY".equals(type)) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
            if (days <= 0) {
                days = 1;
            }
            duration = BigDecimal.valueOf(days);
            durationLabel = days + " Day" + (days > 1 ? "s" : "");
        } else {
            // MONTHLY: 1 month = 30 days
            long days = java.time.temporal.ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
            if (days <= 30) {
                duration = BigDecimal.ONE;
                durationLabel = "1 Month (" + (days == 0 ? 1 : days) + " days)";
            } else {
                double months = Math.round((days / 30.0) * 10.0) / 10.0;
                duration = BigDecimal.valueOf(months);
                durationLabel = months + " Months (" + days + " days)";
            }
        }

        // Authoritative Database Function Invocation via Spring JDBC
        BigDecimal totalAmount = rentalItemRepository.callCalculateRentalAmount(quantity, duration, unitRate);

        // Check availability without reserving
        boolean isAvailable = rentalRepository.checkEquipmentAvailability(
                request.getEquipmentId(),
                request.getStartDate(),
                request.getEndDate(),
                null
        );

        String availabilityMessage;
        if ("MAINTENANCE".equalsIgnoreCase(equipment.getStatus())) {
            isAvailable = false;
            availabilityMessage = "Equipment is currently under maintenance.";
        } else if (isAvailable) {
            availabilityMessage = "Equipment is available for the selected dates.";
        } else {
            availabilityMessage = "Equipment is already booked for the overlapping period.";
        }

        String quoteRef = "QT-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + (int) (Math.random() * 90000 + 10000);

        return new QuotationResponse(
                quoteRef,
                equipment.getEquipmentId(),
                equipment.getEquipmentName(),
                equipment.getEquipmentCode(),
                equipment.getBrand(),
                equipment.getModel(),
                equipment.getCategoryName(),
                equipment.getLocation(),
                type,
                request.getStartDate(),
                request.getEndDate(),
                duration,
                durationLabel,
                quantity,
                unitRate,
                totalAmount,
                totalAmount,
                isAvailable,
                availabilityMessage
        );
    }

    /**
     * Atomically creates a rental header and all associated rental items.
     * Enforces pessimistic row-level locking on equipment, prevents duplicate items,
     * checks date overlap, and calculates amounts via database functions.
     * Rolls back entire transaction if any item is unavailable or invalid.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public RentalResponse createRental(RentalCreateRequest request, UserPrincipal principal) {
        // 1. Resolve and validate customer from JWT principal ONLY
        if (principal == null || !principal.isCustomer()) {
            throw new ForbiddenException("Only authenticated customers may create rental bookings");
        }
        Long customerId = principal.getId();

        if (!rentalRepository.isCustomerActive(customerId)) {
            throw new BadRequestException("Customer does not exist or is inactive");
        }

        // Verify customer has no outstanding/unpaid maintenance charges
        if (maintenanceRepository.hasUnpaidMaintenance(customerId)) {
            BigDecimal unpaid = maintenanceRepository.getUnpaidMaintenanceTotal(customerId);
            throw new BadRequestException("Rental blocked: You have outstanding equipment maintenance dues of LKR " + unpaid + ". Please settle all outstanding maintenance fees before booking new equipment.");
        }

        // 2. Validate dates
        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();
        if (startDate == null || endDate == null) {
            throw new BadRequestException("Start date and end date are required");
        }
        if (endDate.isBefore(startDate)) {
            throw new BadRequestException("End date cannot be before start date");
        }

        // 3. Validate items
        List<RentalItemRequest> items = request.getItems();
        if (items == null || items.isEmpty()) {
            throw new BadRequestException("At least one rental item is required");
        }

        Set<Long> uniqueEquipmentIds = new HashSet<>();
        for (RentalItemRequest item : items) {
            if (!uniqueEquipmentIds.add(item.getEquipmentId())) {
                throw new ConflictException("Equipment already exists in this rental: " + item.getEquipmentId());
            }
            if (item.getRentalType() == null || item.getRentalType().isBlank()) {
                throw new BadRequestException("Rental type is required");
            }
            String type = item.getRentalType().trim().toUpperCase();
            if (!List.of("HOURLY", "DAILY", "MONTHLY").contains(type)) {
                throw new BadRequestException("Invalid rental type. Must be HOURLY, DAILY, or MONTHLY");
            }
            if ("HOURLY".equalsIgnoreCase(type) && !startDate.isEqual(endDate)) {
                throw new BadRequestException("Hourly rental must have the same start and end date");
            }
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new BadRequestException("Quantity must be greater than 0");
            }

            // Authoritatively resolve duration based on rental type and date range
            if ("HOURLY".equals(type)) {
                if (item.getDuration() == null || item.getDuration().compareTo(BigDecimal.ZERO) <= 0) {
                    item.setDuration(new BigDecimal("8.00"));
                }
            } else if ("DAILY".equals(type)) {
                long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
                if (days <= 0) days = 1;
                item.setDuration(BigDecimal.valueOf(days));
            } else if ("MONTHLY".equals(type)) {
                long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
                if (days <= 30) {
                    item.setDuration(BigDecimal.ONE);
                } else {
                    double months = Math.round((days / 30.0) * 10.0) / 10.0;
                    item.setDuration(BigDecimal.valueOf(months));
                }
            }
        }

        // 4. Acquire pessimistic locks on all equipment rows in deterministic order to serialize concurrent bookings and prevent deadlocks
        List<Long> sortedEquipmentIds = items.stream()
                .map(RentalItemRequest::getEquipmentId)
                .sorted()
                .toList();
        for (Long eqId : sortedEquipmentIds) {
            rentalRepository.lockEquipmentRow(eqId);
        }

        // 5. Pre-validate equipment existence, active status, maintenance status, rates, and date availability
        for (RentalItemRequest item : items) {
            EquipmentResponse equipment = equipmentRepository.findById(item.getEquipmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + item.getEquipmentId()));

            if (equipment.getIsActive() != null && !equipment.getIsActive()) {
                throw new BadRequestException("Equipment " + equipment.getEquipmentName() + " is inactive and cannot be rented");
            }

            if ("MAINTENANCE".equalsIgnoreCase(equipment.getStatus())) {
                throw new BadRequestException("Equipment " + equipment.getEquipmentName() + " is under maintenance and cannot be rented");
            }

            boolean isAvailable = rentalRepository.checkEquipmentAvailability(
                    item.getEquipmentId(), startDate, endDate, null
            );

            if (!isAvailable) {
                throw new ConflictException("Equipment is not available for the selected dates: " + equipment.getEquipmentName());
            }

            BigDecimal unitRate = resolveUnitRate(equipment, item.getRentalType());
            if (unitRate == null || unitRate.compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Rate not configured for rental type " + item.getRentalType() + " on equipment: " + equipment.getEquipmentName());
            }
        }

        // 6. Generate booking reference and payment deadline (15 minutes from database NOW())
        String bookingReference = "BK-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + (int) (Math.random() * 90000 + 10000);
        LocalDateTime paymentDeadline = null; // Passing null defaults to DATE_ADD(NOW(), INTERVAL 15 MINUTE) in MySQL timezone

        // 7. Create rental header (status PENDING_PAYMENT, total 0.00)
        Long rentalId = rentalRepository.createRentalHeader(
                customerId, bookingReference, startDate, endDate, paymentDeadline
        );

        BigDecimal totalAmount = BigDecimal.ZERO;

        // 8. Add rental items and compute amounts via database function
        for (RentalItemRequest item : items) {
            EquipmentResponse equipment = equipmentRepository.findById(item.getEquipmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + item.getEquipmentId()));
            BigDecimal unitRate = resolveUnitRate(equipment, item.getRentalType());

            // Database function calculate_rental_amount
            BigDecimal itemAmount = rentalItemRepository.callCalculateRentalAmount(
                    item.getQuantity(), item.getDuration(), unitRate
            );

            rentalItemRepository.save(
                    rentalId, item.getEquipmentId(), item.getRentalType().toUpperCase(),
                    item.getQuantity(), item.getDuration(), unitRate, itemAmount
            );

            totalAmount = totalAmount.add(itemAmount);
        }

        // 9. Update rental header with final total
        rentalRepository.updateTotalAmount(rentalId, totalAmount);

        // 10. Create pending payment record for schema completeness
        try {
            String paymentSql = """
                INSERT INTO payments (rental_id, amount, payment_method, payment_status)
                VALUES (?, ?, 'PAYHERE', 'PENDING')
                """;
            jdbcTemplate.update(paymentSql, rentalId, totalAmount);
        } catch (Exception ignored) {
            // Ignored if payments table insertion is handled downstream
        }

        return getRentalById(rentalId, principal);
    }

    public RentalResponse getRentalById(Long id, UserPrincipal principal) {
        RentalResponse rental = rentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with ID: " + id));

        // Enforce customer ownership isolation
        if (principal != null && principal.isCustomer() && !rental.getCustomerId().equals(principal.getId())) {
            throw new ForbiddenException("You do not have permission to access this rental");
        }

        List<RentalItemResponse> items = rentalItemRepository.findByRentalId(id);
        rental.setItems(items);
        return rental;
    }

    public RentalResponse getRentalByBookingReference(String bookingReference, UserPrincipal principal) {
        RentalResponse rental = rentalRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with booking reference: " + bookingReference));

        // Enforce customer ownership isolation
        if (principal != null && principal.isCustomer() && !rental.getCustomerId().equals(principal.getId())) {
            throw new ForbiddenException("You do not have permission to access this rental");
        }

        List<RentalItemResponse> items = rentalItemRepository.findByRentalId(rental.getRentalId());
        rental.setItems(items);
        return rental;
    }

    public List<RentalResponse> getRentalsByCustomer(Long customerId, UserPrincipal principal) {
        if (principal != null && principal.isCustomer() && !customerId.equals(principal.getId())) {
            throw new ForbiddenException("You do not have permission to view rentals for other customers");
        }

        List<RentalResponse> rentals = rentalRepository.findByCustomerId(customerId);
        for (RentalResponse rental : rentals) {
            rental.setItems(rentalItemRepository.findByRentalId(rental.getRentalId()));
        }
        return rentals;
    }

    public List<RentalResponse> getMyRentals(UserPrincipal principal) {
        if (principal == null || !principal.isCustomer()) {
            throw new ForbiddenException("Only authenticated customers can access their personal rentals");
        }
        return getRentalsByCustomer(principal.getId(), principal);
    }

    public List<RentalResponse> getAllRentals(String status, UserPrincipal principal) {
        if (principal != null && principal.isCustomer()) {
            throw new ForbiddenException("Customers are not permitted to view all rentals");
        }

        List<RentalResponse> rentals = rentalRepository.findAll(status);
        for (RentalResponse rental : rentals) {
            rental.setItems(rentalItemRepository.findByRentalId(rental.getRentalId()));
        }
        return rentals;
    }

    /**
     * Retrieves current active/confirmed rentals from the operations board view `view_active_rentals`.
     */
    public List<ActiveRentalResponse> getActiveRentals(UserPrincipal principal) {
        if (principal != null && principal.isCustomer()) {
            throw new ForbiddenException("Customers are not permitted to view active rentals operations board");
        }
        return rentalRepository.findActiveRentals();
    }

    @Transactional
    public RentalResponse cancelRental(Long rentalId, UserPrincipal principal) {
        RentalResponse rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with ID: " + rentalId));

        if (principal != null && principal.isCustomer() && !rental.getCustomerId().equals(principal.getId())) {
            throw new ForbiddenException("You do not have permission to cancel this rental");
        }

        String currentStatus = rental.getStatus();
        if (!"PENDING_PAYMENT".equalsIgnoreCase(currentStatus) && !"CONFIRMED".equalsIgnoreCase(currentStatus)) {
            throw new ConflictException("Rental cannot be cancelled in its current status: " + currentStatus);
        }

        rentalRepository.cancelRental(rentalId);

        if ("CONFIRMED".equalsIgnoreCase(currentStatus)) {
            try {
                jdbcTemplate.update("UPDATE payments SET payment_status = 'REFUNDED' WHERE rental_id = ?", rentalId);
            } catch (Exception ignored) {
                // Ignore if payments table is managed differently
            }
        }

        return getRentalById(rentalId, principal);
    }

    @Transactional
    public RentalResponse updateRentalStatus(Long rentalId, String targetStatus, UserPrincipal principal) {
        if (principal != null && principal.isCustomer()) {
            throw new ForbiddenException("Customers are not permitted to update rental operational status");
        }

        RentalResponse rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with ID: " + rentalId));

        String currentStatus = rental.getStatus().toUpperCase();
        String newStatus = targetStatus.toUpperCase();

        if ("ACTIVE".equals(newStatus)) {
            if (!"CONFIRMED".equals(currentStatus)) {
                throw new ConflictException("Cannot record pickup. Rental must be in CONFIRMED state. Current status: " + currentStatus);
            }
            rentalRepository.recordPickup(rentalId, LocalDateTime.now());
            // Update equipment status to RENTED
            List<RentalItemResponse> items = rentalItemRepository.findByRentalId(rentalId);
            for (RentalItemResponse item : items) {
                equipmentRepository.updateStatus(item.getEquipmentId(), "RENTED");
            }
        } else if ("COMPLETED".equals(newStatus)) {
            if (!"ACTIVE".equals(currentStatus)) {
                throw new ConflictException("Cannot complete rental. Rental must be in ACTIVE state. Current status: " + currentStatus);
            }
            rentalRepository.updateStatus(rentalId, "COMPLETED");
            // Update equipment status back to AVAILABLE
            List<RentalItemResponse> items = rentalItemRepository.findByRentalId(rentalId);
            for (RentalItemResponse item : items) {
                equipmentRepository.updateStatus(item.getEquipmentId(), "AVAILABLE");
            }
        } else if ("CONFIRMED".equals(newStatus)) {
            if (!"PENDING_PAYMENT".equals(currentStatus)) {
                throw new ConflictException("Cannot confirm rental. Rental must be in PENDING_PAYMENT state. Current status: " + currentStatus);
            }
            rentalRepository.updateStatus(rentalId, "CONFIRMED");
        } else if ("CANCELLED".equals(newStatus)) {
            return cancelRental(rentalId, principal);
        } else {
            throw new ConflictException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        return getRentalById(rentalId, principal);
    }

    @Transactional
    public RentalResponse recordPickup(Long rentalId, UserPrincipal principal) {
        return updateRentalStatus(rentalId, "ACTIVE", principal);
    }

    private BigDecimal resolveUnitRate(EquipmentResponse eq, String rentalType) {
        return switch (rentalType.toUpperCase()) {
            case "HOURLY" -> eq.getHourlyRate();
            case "DAILY" -> eq.getDailyRate();
            case "MONTHLY" -> eq.getMonthlyRate();
            default -> null;
        };
    }
}
