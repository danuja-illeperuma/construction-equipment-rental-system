package com.constructionrental.system.payment.service;

import com.constructionrental.system.common.exception.BadRequestException;
import com.constructionrental.system.common.exception.ForbiddenException;
import com.constructionrental.system.common.exception.ResourceNotFoundException;
import com.constructionrental.system.payment.dto.request.PaymentCreateRequest;
import com.constructionrental.system.payment.dto.request.SimulatePaymentRequest;
import com.constructionrental.system.payment.dto.response.PaymentResponse;
import com.constructionrental.system.payment.dto.response.SuccessfulPaymentResponse;
import com.constructionrental.system.payment.repository.PaymentRepository;
import com.constructionrental.system.rental.dto.response.RentalResponse;
import com.constructionrental.system.rental.repository.RentalRepository;
import com.constructionrental.system.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final RentalRepository rentalRepository;

    @Value("${payhere.merchant.id:${PAYHERE_MERCHANT_ID:}}")
    private String merchantId;

    @Value("${payhere.merchant.secret:${PAYHERE_MERCHANT_SECRET:}}")
    private String merchantSecret;

    @Value("${payhere.is.sandbox:${PAYHERE_IS_SANDBOX:true}}")
    private boolean isSandbox;

    public PaymentService(PaymentRepository paymentRepository, RentalRepository rentalRepository) {
        this.paymentRepository = paymentRepository;
        this.rentalRepository = rentalRepository;
    }

    public PaymentResponse getPaymentById(Long id, UserPrincipal principal) {
        PaymentResponse payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));

        if (principal != null && principal.isCustomer()) {
            if (payment.getCustomerId() != null && !payment.getCustomerId().equals(principal.getId())) {
                throw new ForbiddenException("You do not have permission to view payments for another customer");
            }
        }

        return payment;
    }

    public PaymentResponse getPaymentByRentalId(Long rentalId, UserPrincipal principal) {
        PaymentResponse payment = paymentRepository.findByRentalId(rentalId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for rental ID: " + rentalId));

        if (principal != null && principal.isCustomer()) {
            if (payment.getCustomerId() != null && !payment.getCustomerId().equals(principal.getId())) {
                throw new ForbiddenException("You do not have permission to view payments for another customer");
            }
        }

        return payment;
    }

    public PaymentResponse getPaymentByBookingReference(String bookingReference, UserPrincipal principal) {
        PaymentResponse payment = paymentRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for booking reference: " + bookingReference));

        if (principal != null && principal.isCustomer()) {
            if (payment.getCustomerId() != null && !payment.getCustomerId().equals(principal.getId())) {
                throw new ForbiddenException("You do not have permission to view payments for another customer");
            }
        }

        return payment;
    }

    public List<PaymentResponse> getMyPayments(UserPrincipal principal) {
        if (principal == null || !principal.isCustomer()) {
            throw new ForbiddenException("Only authenticated customers can access their personal payments");
        }
        return paymentRepository.findByCustomerId(principal.getId());
    }

    public List<PaymentResponse> getAllPayments(String status, UserPrincipal principal) {
        if (principal != null && principal.isCustomer()) {
            throw new ForbiddenException("Customers are not permitted to access full payment records");
        }
        return paymentRepository.findAll(status);
    }

    /**
     * Retrieves finance ledger of successful payments using MySQL View `view_successful_payments`.
     */
    public List<SuccessfulPaymentResponse> getSuccessfulPayments(UserPrincipal principal) {
        if (principal != null && principal.isCustomer()) {
            throw new ForbiddenException("Customers are not permitted to access payments ledger");
        }
        return paymentRepository.findSuccessfulPayments();
    }

    public PaymentResponse initiatePayment(PaymentCreateRequest request, UserPrincipal principal) {
        if (principal == null || !principal.isCustomer()) {
            throw new ForbiddenException("Only authenticated customers can initiate payments");
        }

        RentalResponse rental = rentalRepository.findById(request.getRentalId())
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with ID: " + request.getRentalId()));

        if (!rental.getCustomerId().equals(principal.getId())) {
            throw new ForbiddenException("You can only initiate payment for your own rental");
        }

        if (!"PENDING_PAYMENT".equalsIgnoreCase(rental.getStatus())) {
            throw new BadRequestException("Rental is not in PENDING_PAYMENT status. Current status: " + rental.getStatus());
        }

        Long paymentId = paymentRepository.callCreatePayment(rental.getRentalId(), request.getPaymentMethod());
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found after initialization: " + paymentId));
    }

    /**
     * Simulated payment fallback (Plan B / test harness) - defaults to SUCCESS.
     */
    public PaymentResponse simulatePayment(Long rentalOrPaymentId, UserPrincipal principal) {
        return simulatePayment(rentalOrPaymentId, "SUCCESS", principal);
    }

    /**
     * Simulated payment with specified outcome (SUCCESS or FAILED) by ID.
     */
    public PaymentResponse simulatePayment(Long rentalOrPaymentId, String outcome, UserPrincipal principal) {
        if (principal == null || !principal.isCustomer()) {
            throw new ForbiddenException("Only authenticated customers can process payment for customer bookings");
        }

        String targetStatus = (outcome != null && outcome.trim().equalsIgnoreCase("FAILED")) ? "FAILED" : "SUCCESS";

        PaymentResponse payment = paymentRepository.findById(rentalOrPaymentId)
                .or(() -> paymentRepository.findByRentalId(rentalOrPaymentId))
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for ID: " + rentalOrPaymentId));

        return executeSimulatedPayment(payment, targetStatus, principal);
    }

    /**
     * Simulated payment by booking reference with specified outcome.
     */
    public PaymentResponse simulatePaymentByBookingReference(String bookingReference, String outcome, UserPrincipal principal) {
        if (principal == null || !principal.isCustomer()) {
            throw new ForbiddenException("Only authenticated customers can process payment for customer bookings");
        }

        String targetStatus = (outcome != null && outcome.trim().equalsIgnoreCase("FAILED")) ? "FAILED" : "SUCCESS";

        rentalRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with booking reference: " + bookingReference));

        PaymentResponse payment = paymentRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("No payment record found for booking reference: " + bookingReference));

        return executeSimulatedPayment(payment, targetStatus, principal);
    }

    /**
     * Simulated payment via structured request payload.
     */
    public PaymentResponse simulatePayment(SimulatePaymentRequest request, UserPrincipal principal) {
        if (principal == null || !principal.isCustomer()) {
            throw new ForbiddenException("Only authenticated customers can process payment for customer bookings");
        }

        String targetStatus = (request.getStatus() != null && request.getStatus().trim().equalsIgnoreCase("FAILED")) ? "FAILED" : "SUCCESS";

        PaymentResponse payment;
        if (request.getBookingReference() != null && !request.getBookingReference().isBlank()) {
            rentalRepository.findByBookingReference(request.getBookingReference())
                    .orElseThrow(() -> new ResourceNotFoundException("Rental not found with booking reference: " + request.getBookingReference()));

            payment = paymentRepository.findByBookingReference(request.getBookingReference())
                    .orElseThrow(() -> new ResourceNotFoundException("No payment record found for booking reference: " + request.getBookingReference()));
        } else if (request.getRentalId() != null) {
            rentalRepository.findById(request.getRentalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Rental not found with ID: " + request.getRentalId()));

            payment = paymentRepository.findByRentalId(request.getRentalId())
                    .orElseThrow(() -> new ResourceNotFoundException("No payment record found for rental ID: " + request.getRentalId()));
        } else {
            throw new BadRequestException("Either rentalId or bookingReference must be provided");
        }

        return executeSimulatedPayment(payment, targetStatus, principal);
    }

    private PaymentResponse executeSimulatedPayment(PaymentResponse payment, String targetStatus, UserPrincipal principal) {
        // Customer ownership isolation check
        if (payment.getCustomerId() != null && !payment.getCustomerId().equals(principal.getId())) {
            throw new ForbiddenException("You can only process payment for your own rental");
        }

        // Idempotency: if already SUCCESS and requested SUCCESS, return existing record
        if ("SUCCESS".equalsIgnoreCase(payment.getPaymentStatus())) {
            if ("SUCCESS".equalsIgnoreCase(targetStatus)) {
                log.info("Payment {} is already completed. Returning existing successful payment idempotently.", payment.getPaymentId());
                return paymentRepository.findById(payment.getPaymentId())
                        .orElse(payment);
            } else {
                throw new BadRequestException("Cannot modify already completed successful payment");
            }
        }

        // Verify associated rental status
        RentalResponse rental = rentalRepository.findById(payment.getRentalId())
                .orElseThrow(() -> new ResourceNotFoundException("Associated rental not found with ID: " + payment.getRentalId()));

        if ("CANCELLED".equalsIgnoreCase(rental.getStatus()) ||
            "EXPIRED".equalsIgnoreCase(rental.getStatus()) ||
            "COMPLETED".equalsIgnoreCase(rental.getStatus())) {
            throw new BadRequestException("Payment cannot be processed for terminated rental with status: " + rental.getStatus());
        }

        if ("SUCCESS".equalsIgnoreCase(targetStatus)) {
            String txRef = "SIM-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            paymentRepository.callProcessPayment(payment.getPaymentId(), "SUCCESS", txRef);
        } else {
            String txRef = "FAIL-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            paymentRepository.callProcessPayment(payment.getPaymentId(), "FAILED", txRef);
        }

        return paymentRepository.findById(payment.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + payment.getPaymentId()));
    }

    /**
     * Processes PayHere Webhook (IPN notification).
     * Verifies payment status, ensures idempotency, and transitions rental to CONFIRMED.
     */
    public void processPayHereNotification(Map<String, String> params) {
        String orderIdStr = params.get("order_id");
        String statusCode = params.get("status_code");
        String payHerePaymentId = params.get("payment_id");
        String payHereAmount = params.get("payhere_amount");
        String payHereCurrency = params.get("payhere_currency");
        String md5Sig = params.get("md5sig");

        if (orderIdStr == null || statusCode == null) {
            throw new BadRequestException("Missing required PayHere notification parameters: order_id and status_code are required");
        }

        Long rentalId = resolveRentalId(orderIdStr);

        PaymentResponse payment = paymentRepository.findByRentalId(rentalId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for rental ID: " + rentalId));

        // PayHere signature verification if merchant secret is configured
        if (merchantSecret != null && !merchantSecret.isBlank() && md5Sig != null && !md5Sig.isBlank()) {
            String calculatedMd5 = calculatePayHereMd5(merchantId, orderIdStr, payHereAmount, payHereCurrency, statusCode, merchantSecret);
            if (!calculatedMd5.equalsIgnoreCase(md5Sig)) {
                log.warn("PayHere signature mismatch for order_id: {}", orderIdStr);
                throw new BadRequestException("Invalid PayHere signature");
            }
        }

        // Amount verification
        if (payHereAmount != null) {
            BigDecimal reportedAmount = new BigDecimal(payHereAmount);
            if (reportedAmount.compareTo(payment.getAmount()) != 0) {
                log.warn("PayHere amount mismatch: reported {} vs expected {}", reportedAmount, payment.getAmount());
                throw new BadRequestException("Payment amount mismatch");
            }
        }

        String targetStatus;
        if ("2".equals(statusCode)) {
            targetStatus = "SUCCESS";
        } else if ("0".equals(statusCode)) {
            targetStatus = "PENDING";
        } else if ("-1".equals(statusCode)) {
            targetStatus = "EXPIRED";
        } else {
            targetStatus = "FAILED";
        }

        String txRef = (payHerePaymentId != null && !payHerePaymentId.isBlank()) 
                ? payHerePaymentId 
                : "PH-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();

        paymentRepository.callProcessPayment(payment.getPaymentId(), targetStatus, txRef);
    }

    private Long resolveRentalId(String orderIdStr) {
        try {
            return Long.parseLong(orderIdStr);
        } catch (NumberFormatException e) {
            RentalResponse r = rentalRepository.findByBookingReference(orderIdStr)
                    .orElseThrow(() -> new ResourceNotFoundException("Rental not found for booking reference: " + orderIdStr));
            return r.getRentalId();
        }
    }

    private String calculatePayHereMd5(String merchantId, String orderId, String amount, String currency, String statusCode, String secret) {
        String secretHash = md5(secret);
        String combined = (merchantId != null ? merchantId : "")
                + (orderId != null ? orderId : "")
                + (amount != null ? amount : "")
                + (currency != null ? currency : "")
                + (statusCode != null ? statusCode : "")
                + secretHash;
        return md5(combined);
    }

    private String md5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            BigInteger no = new BigInteger(1, messageDigest);
            String hashtext = no.toString(16);
            while (hashtext.length() < 32) {
                hashtext = "0" + hashtext;
            }
            return hashtext.toUpperCase();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 algorithm not found", e);
        }
    }
}
