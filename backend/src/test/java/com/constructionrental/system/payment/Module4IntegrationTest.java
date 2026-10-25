package com.constructionrental.system.payment;

import com.constructionrental.system.payment.dto.request.PaymentCreateRequest;
import com.constructionrental.system.payment.dto.request.SimulatePaymentRequest;
import com.constructionrental.system.rental.repository.RentalRepository;
import com.constructionrental.system.returns.dto.request.DamageReportRequest;
import com.constructionrental.system.returns.dto.request.EquipmentReturnRequest;
import com.constructionrental.system.security.JwtTokenProvider;
import com.constructionrental.system.security.UserPrincipal;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class Module4IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private RentalRepository rentalRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private Long customer1Id;
    private UserPrincipal customer1Principal;
    private String customer1Token;

    private Long customer2Id;
    private UserPrincipal customer2Principal;
    private String customer2Token;

    private Long staffId;
    private UserPrincipal staffPrincipal;
    private String staffToken;

    private Long managerId;
    private UserPrincipal managerPrincipal;
    private String managerToken;

    private Long equipment1Id;
    private Long equipment2Id;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);

        // 1. Customer 1
        String cust1Email = "m4cust1_" + suffix + "@cerms.test";
        String cust1Phone = "071" + ((long) (Math.random() * 9000000L + 1000000L));
        jdbcTemplate.update("""
            INSERT INTO customers (name, email, phone, nic_or_br_number, customer_type, address, password_hash, is_active)
            VALUES (?, ?, ?, ?, 'INDIVIDUAL', 'Colombo 03', '$2a$10$dummyHashDummmyHashDummyHash', 1)
            """, "M4 Customer 1 " + suffix, cust1Email, cust1Phone, "NIC1-" + suffix);
        customer1Id = jdbcTemplate.queryForObject("SELECT customer_id FROM customers WHERE email = ?", Long.class, cust1Email);
        customer1Principal = new UserPrincipal(customer1Id, cust1Email, "pass", "Customer One", "CUSTOMER", "CUSTOMER", true, "INDIVIDUAL");
        customer1Token = jwtTokenProvider.generateToken(customer1Principal);

        // 2. Customer 2
        String cust2Email = "m4cust2_" + suffix + "@cerms.test";
        String cust2Phone = "072" + ((long) (Math.random() * 9000000L + 1000000L));
        jdbcTemplate.update("""
            INSERT INTO customers (name, email, phone, nic_or_br_number, customer_type, address, password_hash, is_active)
            VALUES (?, ?, ?, ?, 'INDIVIDUAL', 'Kandy', '$2a$10$dummyHashDummmyHashDummyHash', 1)
            """, "M4 Customer 2 " + suffix, cust2Email, cust2Phone, "NIC2-" + suffix);
        customer2Id = jdbcTemplate.queryForObject("SELECT customer_id FROM customers WHERE email = ?", Long.class, cust2Email);
        customer2Principal = new UserPrincipal(customer2Id, cust2Email, "pass", "Customer Two", "CUSTOMER", "CUSTOMER", true, "INDIVIDUAL");
        customer2Token = jwtTokenProvider.generateToken(customer2Principal);

        // 3. Staff User
        String staffEmail = "m4staff_" + suffix + "@cerms.test";
        jdbcTemplate.update("""
            INSERT INTO users (full_name, email, password_hash, role, phone, is_active)
            VALUES (?, ?, '$2a$10$dummyHashDummmyHashDummyHash', 'STAFF', '0771112222', 1)
            """, "M4 Staff User", staffEmail);
        staffId = jdbcTemplate.queryForObject("SELECT user_id FROM users WHERE email = ?", Long.class, staffEmail);
        staffPrincipal = new UserPrincipal(staffId, staffEmail, "pass", "M4 Staff User", "STAFF", "USER", false, null);
        staffToken = jwtTokenProvider.generateToken(staffPrincipal);

        // 4. Manager User
        String mgrEmail = "m4mgr_" + suffix + "@cerms.test";
        jdbcTemplate.update("""
            INSERT INTO users (full_name, email, password_hash, role, phone, is_active)
            VALUES (?, ?, '$2a$10$dummyHashDummmyHashDummyHash', 'MANAGER', '0773334444', 1)
            """, "M4 Manager User", mgrEmail);
        managerId = jdbcTemplate.queryForObject("SELECT user_id FROM users WHERE email = ?", Long.class, mgrEmail);
        managerPrincipal = new UserPrincipal(managerId, mgrEmail, "pass", "M4 Manager User", "MANAGER", "USER", false, null);
        managerToken = jwtTokenProvider.generateToken(managerPrincipal);

        // 5. Test Equipment
        String code1 = "EQ4-" + suffix + "-A";
        jdbcTemplate.update("""
            INSERT INTO equipment (equipment_code, equipment_name, category_id, hourly_rate, daily_rate, monthly_rate, status, is_active)
            VALUES (?, 'Excavator 20T', 1, 2500.00, 16000.00, 320000.00, 'AVAILABLE', 1)
            """, code1);
        equipment1Id = jdbcTemplate.queryForObject("SELECT equipment_id FROM equipment WHERE equipment_code = ?", Long.class, code1);

        String code2 = "EQ4-" + suffix + "-B";
        jdbcTemplate.update("""
            INSERT INTO equipment (equipment_code, equipment_name, category_id, hourly_rate, daily_rate, monthly_rate, status, is_active)
            VALUES (?, 'Backhoe Loader', 1, 1800.00, 12000.00, 240000.00, 'AVAILABLE', 1)
            """, code2);
        equipment2Id = jdbcTemplate.queryForObject("SELECT equipment_id FROM equipment WHERE equipment_code = ?", Long.class, code2);
    }

    private Long createRentalWithItem(Long customerId, Long equipmentId, String rentalType, BigDecimal duration, BigDecimal unitRate) {
        String ref = "BK-M4-" + UUID.randomUUID().toString().substring(0, 8);
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(2);
        BigDecimal total = duration.multiply(unitRate);

        jdbcTemplate.update("""
            INSERT INTO rentals (booking_reference, customer_id, start_date, end_date, total_amount, status, payment_deadline, created_at)
            VALUES (?, ?, ?, ?, ?, 'PENDING_PAYMENT', DATE_ADD(NOW(), INTERVAL 24 HOUR), NOW())
            """, ref, customerId, start, end, total);
        Long rentalId = jdbcTemplate.queryForObject("SELECT rental_id FROM rentals WHERE booking_reference = ?", Long.class, ref);

        jdbcTemplate.update("""
            INSERT INTO rental_items (rental_id, equipment_id, rental_type, quantity, duration, unit_rate, item_amount)
            VALUES (?, ?, ?, 1, ?, ?, ?)
            """, rentalId, equipmentId, rentalType, duration, unitRate, total);

        return rentalId;
    }

    @Test
    @DisplayName("1. Payment Creation - Customer initiates payment for own rental in PENDING_PAYMENT")
    void testCreatePayment_Success() throws Exception {
        Long rentalId = createRentalWithItem(customer1Id, equipment1Id, "DAILY", new BigDecimal("2.00"), new BigDecimal("16000.00"));

        PaymentCreateRequest request = new PaymentCreateRequest();
        request.setRentalId(rentalId);
        request.setPaymentMethod("PAYHERE");

        MvcResult result = mockMvc.perform(post("/api/v1/payments")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.rentalId").value(rentalId))
                .andExpect(jsonPath("$.data.amount").value(32000.00))
                .andExpect(jsonPath("$.data.paymentStatus").value("PENDING"))
                .andExpect(jsonPath("$.data.paymentMethod").value("PAYHERE"))
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        assertNotNull(json.path("data").path("paymentId").asText());
    }

    @Test
    @DisplayName("2. Simulated Payment - Confirms rental and transitions payment to SUCCESS")
    void testSimulatePayment_Success() throws Exception {
        Long rentalId = createRentalWithItem(customer1Id, equipment1Id, "DAILY", new BigDecimal("1.00"), new BigDecimal("16000.00"));

        // Initialize payment
        PaymentCreateRequest createReq = new PaymentCreateRequest();
        createReq.setRentalId(rentalId);
        createReq.setPaymentMethod("SIMULATED");

        MvcResult createResult = mockMvc.perform(post("/api/v1/payments")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode createNode = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long paymentId = createNode.path("data").path("paymentId").asLong();

        // Simulate payment
        mockMvc.perform(post("/api/v1/payments/" + paymentId + "/simulate")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.paymentStatus").value("SUCCESS"))
                .andExpect(jsonPath("$.data.paidAt").isNotEmpty())
                .andExpect(jsonPath("$.data.transactionReference").isNotEmpty());

        // Verify rental status updated to CONFIRMED
        String rentalStatus = jdbcTemplate.queryForObject("SELECT status FROM rentals WHERE rental_id = ?", String.class, rentalId);
        assertEquals("CONFIRMED", rentalStatus);
    }

    @Test
    @DisplayName("3. Customer Ownership Protection - Customer cannot pay or view other customer's payment")
    void testCustomerOwnershipProtection() throws Exception {
        Long rental1Id = createRentalWithItem(customer1Id, equipment1Id, "DAILY", new BigDecimal("1.00"), new BigDecimal("16000.00"));

        // Customer 1 initiates payment
        PaymentCreateRequest createReq = new PaymentCreateRequest();
        createReq.setRentalId(rental1Id);
        createReq.setPaymentMethod("SIMULATED");

        MvcResult createResult = mockMvc.perform(post("/api/v1/payments")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode createNode = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long paymentId = createNode.path("data").path("paymentId").asLong();

        // Customer 2 attempts to simulate payment on Customer 1's rental -> 403 Forbidden
        mockMvc.perform(post("/api/v1/payments/" + paymentId + "/simulate")
                        .header("Authorization", "Bearer " + customer2Token))
                .andExpect(status().isForbidden());

        // Customer 2 attempts to view Customer 1's payment details -> 403 Forbidden
        mockMvc.perform(get("/api/v1/payments/" + paymentId)
                        .header("Authorization", "Bearer " + customer2Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("4. Duplicate Payment Prevention - Reuses existing payment row")
    void testDuplicatePaymentPrevention() throws Exception {
        Long rentalId = createRentalWithItem(customer1Id, equipment1Id, "DAILY", new BigDecimal("1.00"), new BigDecimal("16000.00"));

        PaymentCreateRequest createReq = new PaymentCreateRequest();
        createReq.setRentalId(rentalId);
        createReq.setPaymentMethod("PAYHERE");

        // First creation
        MvcResult res1 = mockMvc.perform(post("/api/v1/payments")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        long payment1Id = objectMapper.readTree(res1.getResponse().getContentAsString()).path("data").path("paymentId").asLong();

        // Second creation attempt on same rental
        MvcResult res2 = mockMvc.perform(post("/api/v1/payments")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        long payment2Id = objectMapper.readTree(res2.getResponse().getContentAsString()).path("data").path("paymentId").asLong();

        assertEquals(payment1Id, payment2Id, "Duplicate payment creation should reuse existing payment row");

        int count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM payments WHERE rental_id = ?", Integer.class, rentalId);
        assertEquals(1, count, "Exactly ONE payment row per rental must exist");
    }

    @Test
    @DisplayName("5. On-time Return Processing - Zero late charge, equipment AVAILABLE, rental COMPLETED")
    void testProcessReturn_OnTime() throws Exception {
        Long rentalId = createRentalWithItem(customer1Id, equipment1Id, "DAILY", new BigDecimal("2.00"), new BigDecimal("16000.00"));

        // Confirm rental
        jdbcTemplate.update("UPDATE rentals SET status = 'CONFIRMED' WHERE rental_id = ?", rentalId);

        // Handover (Pickup) -> status becomes ACTIVE and equipment RENTED
        LocalDateTime pickupTime = LocalDateTime.now().minusHours(4);
        jdbcTemplate.update("UPDATE rentals SET status = 'ACTIVE', pickup_at = ? WHERE rental_id = ?", Timestamp.valueOf(pickupTime), rentalId);
        jdbcTemplate.update("UPDATE equipment SET status = 'RENTED' WHERE equipment_id = ?", equipment1Id);

        Long rentalItemId = jdbcTemplate.queryForObject("SELECT rental_item_id FROM rental_items WHERE rental_id = ?", Long.class, rentalId);

        EquipmentReturnRequest returnReq = new EquipmentReturnRequest();
        returnReq.setRentalItemId(rentalItemId);
        returnReq.setCondition("GOOD");
        returnReq.setNotes("Returned on time in pristine condition");
        returnReq.setReturnedAt(LocalDateTime.now());

        mockMvc.perform(post("/api/v1/returns")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(returnReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.lateCharge").value(0.00))
                .andExpect(jsonPath("$.data.condition").value("GOOD"));

        // Verify equipment is now AVAILABLE
        String equipStatus = jdbcTemplate.queryForObject("SELECT status FROM equipment WHERE equipment_id = ?", String.class, equipment1Id);
        assertEquals("AVAILABLE", equipStatus);

        // Verify rental is now COMPLETED
        String rStatus = jdbcTemplate.queryForObject("SELECT status FROM rentals WHERE rental_id = ?", String.class, rentalId);
        assertEquals("COMPLETED", rStatus);
    }

    @Test
    @DisplayName("6. Late Return Processing - Computes started late units charge via calculate_late_charge")
    void testProcessReturn_Late_CalculatesLateCharge() throws Exception {
        Long rentalId = createRentalWithItem(customer1Id, equipment2Id, "DAILY", new BigDecimal("1.00"), new BigDecimal("12000.00"));

        // Transition PENDING_PAYMENT -> CONFIRMED -> ACTIVE (3 days ago, 1-day rental returned 2 days late = 2 x 12000 = 24000)
        jdbcTemplate.update("UPDATE rentals SET status = 'CONFIRMED' WHERE rental_id = ?", rentalId);
        LocalDateTime pickupTime = LocalDateTime.now().minusDays(3);
        jdbcTemplate.update("UPDATE rentals SET status = 'ACTIVE', pickup_at = ? WHERE rental_id = ?", Timestamp.valueOf(pickupTime), rentalId);
        jdbcTemplate.update("UPDATE equipment SET status = 'RENTED' WHERE equipment_id = ?", equipment2Id);

        Long rentalItemId = jdbcTemplate.queryForObject("SELECT rental_item_id FROM rental_items WHERE rental_id = ?", Long.class, rentalId);

        EquipmentReturnRequest returnReq = new EquipmentReturnRequest();
        returnReq.setRentalItemId(rentalItemId);
        returnReq.setCondition("GOOD");
        returnReq.setNotes("Late return by customer");
        returnReq.setReturnedAt(pickupTime.plusDays(3));

        mockMvc.perform(post("/api/v1/returns")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(returnReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.lateCharge").value(24000.00));
    }

    @Test
    @DisplayName("7. Damaged Return & Damage Report - Equipment MAINTENANCE and damage logged")
    void testDamagedReturn_AndDamageReport() throws Exception {
        Long rentalId = createRentalWithItem(customer1Id, equipment1Id, "DAILY", new BigDecimal("1.00"), new BigDecimal("16000.00"));

        jdbcTemplate.update("UPDATE rentals SET status = 'CONFIRMED' WHERE rental_id = ?", rentalId);
        jdbcTemplate.update("UPDATE rentals SET status = 'ACTIVE', pickup_at = NOW() WHERE rental_id = ?", rentalId);
        jdbcTemplate.update("UPDATE equipment SET status = 'RENTED' WHERE equipment_id = ?", equipment1Id);

        Long rentalItemId = jdbcTemplate.queryForObject("SELECT rental_item_id FROM rental_items WHERE rental_id = ?", Long.class, rentalId);

        // Record DAMAGED return
        EquipmentReturnRequest returnReq = new EquipmentReturnRequest();
        returnReq.setRentalItemId(rentalItemId);
        returnReq.setCondition("DAMAGED");
        returnReq.setNotes("Front hydraulic arm damaged");
        returnReq.setReturnedAt(LocalDateTime.now());

        MvcResult returnResult = mockMvc.perform(post("/api/v1/returns")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(returnReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.condition").value("DAMAGED"))
                .andReturn();

        long returnId = objectMapper.readTree(returnResult.getResponse().getContentAsString()).path("data").path("returnId").asLong();

        // Equipment status must be MAINTENANCE
        String equipStatus = jdbcTemplate.queryForObject("SELECT status FROM equipment WHERE equipment_id = ?", String.class, equipment1Id);
        assertEquals("MAINTENANCE", equipStatus);

        // Create damage report
        DamageReportRequest damageReq = new DamageReportRequest();
        damageReq.setReturnId(returnId);
        damageReq.setDescription("Hydraulic cylinder seals broken and arm bent");
        damageReq.setDamageCharge(new BigDecimal("35000.00"));

        mockMvc.perform(post("/api/v1/damage-reports")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(damageReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.returnId").value(returnId))
                .andExpect(jsonPath("$.data.damageCharge").value(35000.00));

        // Equipment must still be in MAINTENANCE
        String equipStatusAfter = jdbcTemplate.queryForObject("SELECT status FROM equipment WHERE equipment_id = ?", String.class, equipment1Id);
        assertEquals("MAINTENANCE", equipStatusAfter);
    }

    @Test
    @DisplayName("8. Role Restrictions - Customers cannot process returns or log damage")
    void testRoleRestrictions() throws Exception {
        // Customer attempts to call POST /api/v1/returns -> 403 Forbidden
        EquipmentReturnRequest returnReq = new EquipmentReturnRequest();
        returnReq.setRentalItemId(1L);
        returnReq.setCondition("GOOD");

        mockMvc.perform(post("/api/v1/returns")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(returnReq)))
                .andExpect(status().isForbidden());

        // Customer attempts to call POST /api/v1/damage-reports -> 403 Forbidden
        DamageReportRequest damageReq = new DamageReportRequest();
        damageReq.setReturnId(1L);
        damageReq.setDescription("Test damage");
        damageReq.setDamageCharge(new BigDecimal("5000.00"));

        mockMvc.perform(post("/api/v1/damage-reports")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(damageReq)))
                .andExpect(status().isForbidden());

        // Customer attempts to access staff list GET /api/v1/payments -> 403 Forbidden
        mockMvc.perform(get("/api/v1/payments")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isForbidden());

        // Staff CAN access GET /api/v1/payments -> 200 OK
        mockMvc.perform(get("/api/v1/payments")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk());

        // Customer CAN access GET /api/v1/payments/my -> 200 OK
        mockMvc.perform(get("/api/v1/payments/my")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk());
    }
}
