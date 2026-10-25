package com.constructionrental.system.rental;

import com.constructionrental.system.category.dto.CategoryCreateRequest;
import com.constructionrental.system.equipment.dto.EquipmentCreateRequest;
import com.constructionrental.system.equipment.repository.EquipmentRepository;
import com.constructionrental.system.rental.dto.request.AvailabilityRequest;
import com.constructionrental.system.rental.dto.request.RentalCreateRequest;
import com.constructionrental.system.rental.dto.request.RentalItemRequest;
import com.constructionrental.system.rental.dto.request.RentalStatusUpdateRequest;
import com.constructionrental.system.rental.repository.RentalRepository;
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
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class Module3IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EquipmentRepository equipmentRepository;

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

    private UserPrincipal staffPrincipal;
    private String staffToken;

    private UserPrincipal managerPrincipal;
    private String managerToken;

    private UserPrincipal adminPrincipal;
    private String adminToken;

    private Long categoryId;
    private Long equipment1Id;
    private Long equipment2Id;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);

        // 1. Create Customer 1
        String cust1Email = "cust1_" + suffix + "@cerms.test";
        String cust1Phone = "071" + ((long) (Math.random() * 9000000L + 1000000L));
        jdbcTemplate.update("""
            INSERT INTO customers (name, email, phone, nic_or_br_number, customer_type, address, password_hash, is_active)
            VALUES (?, ?, ?, ?, 'INDIVIDUAL', 'Colombo', '$2a$10$dummyHashDummmyHashDummyHash', 1)
            """, "Customer One " + suffix, cust1Email, cust1Phone, "NIC1-" + suffix);
        customer1Id = jdbcTemplate.queryForObject("SELECT customer_id FROM customers WHERE email = ?", Long.class, cust1Email);
        customer1Principal = new UserPrincipal(customer1Id, cust1Email, "pass", "Customer One", "CUSTOMER", "CUSTOMER", true, "INDIVIDUAL");
        customer1Token = jwtTokenProvider.generateToken(customer1Principal);

        // 2. Create Customer 2
        String cust2Email = "cust2_" + suffix + "@cerms.test";
        String cust2Phone = "072" + ((long) (Math.random() * 9000000L + 1000000L));
        jdbcTemplate.update("""
            INSERT INTO customers (name, email, phone, nic_or_br_number, customer_type, address, password_hash, is_active)
            VALUES (?, ?, ?, ?, 'INDIVIDUAL', 'Kandy', '$2a$10$dummyHashDummmyHashDummyHash', 1)
            """, "Customer Two " + suffix, cust2Email, cust2Phone, "NIC2-" + suffix);
        customer2Id = jdbcTemplate.queryForObject("SELECT customer_id FROM customers WHERE email = ?", Long.class, cust2Email);
        customer2Principal = new UserPrincipal(customer2Id, cust2Email, "pass", "Customer Two", "CUSTOMER", "CUSTOMER", true, "INDIVIDUAL");
        customer2Token = jwtTokenProvider.generateToken(customer2Principal);

        // 3. Create Internal User Principals
        staffPrincipal = new UserPrincipal(901L, "staff_" + suffix + "@cerms.test", "pass", "Staff Member", "STAFF", "USER", false, null);
        staffToken = jwtTokenProvider.generateToken(staffPrincipal);

        managerPrincipal = new UserPrincipal(902L, "manager_" + suffix + "@cerms.test", "pass", "Manager User", "MANAGER", "USER", false, null);
        managerToken = jwtTokenProvider.generateToken(managerPrincipal);

        adminPrincipal = new UserPrincipal(903L, "admin_" + suffix + "@cerms.test", "pass", "Admin User", "ADMIN", "USER", false, null);
        adminToken = jwtTokenProvider.generateToken(adminPrincipal);

        // 4. Create Category
        jdbcTemplate.update("""
            INSERT INTO equipment_categories (category_name, description, is_active)
            VALUES (?, 'Test Category Description', 1)
            """, "Cat-" + suffix);
        categoryId = jdbcTemplate.queryForObject("SELECT category_id FROM equipment_categories WHERE category_name = ?", Long.class, "Cat-" + suffix);

        // 5. Create Equipment 1 & 2
        String eq1Code = "EQ1-" + suffix;
        jdbcTemplate.update("""
            INSERT INTO equipment (equipment_code, equipment_name, category_id, brand, model, hourly_rate, daily_rate, monthly_rate, status, location, is_active, created_at)
            VALUES (?, 'Excavator 20T', ?, 'CAT', '320D', 5000.00, 25000.00, 450000.00, 'AVAILABLE', 'Yard A', 1, NOW())
            """, eq1Code, categoryId);
        equipment1Id = jdbcTemplate.queryForObject("SELECT equipment_id FROM equipment WHERE equipment_code = ?", Long.class, eq1Code);

        String eq2Code = "EQ2-" + suffix;
        jdbcTemplate.update("""
            INSERT INTO equipment (equipment_code, equipment_name, category_id, brand, model, hourly_rate, daily_rate, monthly_rate, status, location, is_active, created_at)
            VALUES (?, 'Concrete Mixer 500L', ?, 'Honda', 'CM500', 1500.00, 8000.00, 150000.00, 'AVAILABLE', 'Yard B', 1, NOW())
            """, eq2Code, categoryId);
        equipment2Id = jdbcTemplate.queryForObject("SELECT equipment_id FROM equipment WHERE equipment_code = ?", Long.class, eq2Code);
    }

    @Test
    @DisplayName("Scenario 1: Check Availability - Success, Invalid Dates, and Non-existent/Inactive Equipment")
    void testCheckAvailability() throws Exception {
        LocalDate startDate = LocalDate.now().plusDays(10);
        LocalDate endDate = LocalDate.now().plusDays(15);

        // 1. Valid Availability Check (Both equipment available)
        AvailabilityRequest validReq = new AvailabilityRequest(List.of(equipment1Id, equipment2Id), startDate, endDate);
        mockMvc.perform(post("/api/v1/rentals/availability")
                        .with(user(customer1Principal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.available").value(true))
                .andExpect(jsonPath("$.data.conflictingEquipmentIds").isEmpty());

        // 2. Invalid Date Range: End date before start date -> 400 Bad Request
        AvailabilityRequest invalidDatesReq = new AvailabilityRequest(List.of(equipment1Id), endDate, startDate);
        mockMvc.perform(post("/api/v1/rentals/availability")
                        .with(user(customer1Principal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDatesReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        // 3. Non-existent Equipment -> 404 Not Found
        AvailabilityRequest nonExistentReq = new AvailabilityRequest(List.of(999999L), startDate, endDate);
        mockMvc.perform(post("/api/v1/rentals/availability")
                        .with(user(customer1Principal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nonExistentReq)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        // 4. Inactive Equipment -> 400 Bad Request
        equipmentRepository.updateActiveStatus(equipment2Id, false);
        AvailabilityRequest inactiveReq = new AvailabilityRequest(List.of(equipment2Id), startDate, endDate);
        mockMvc.perform(post("/api/v1/rentals/availability")
                        .with(user(customer1Principal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inactiveReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("Scenario 2: Rental Booking Lifecycle, Customer Spoof Protection, Concurrency Overlap Rejection")
    void testRentalBookingAndConcurrencyProtection() throws Exception {
        LocalDate startDate = LocalDate.now().plusDays(20);
        LocalDate endDate = LocalDate.now().plusDays(25);

        // 1. Create Rental with 2 items: 1 DAILY (5 days), 1 DAILY (5 days)
        RentalItemRequest item1 = new RentalItemRequest(equipment1Id, "DAILY", 1, new BigDecimal("5.00"));
        RentalItemRequest item2 = new RentalItemRequest(equipment2Id, "DAILY", 1, new BigDecimal("5.00"));

        RentalCreateRequest createReq = new RentalCreateRequest();
        createReq.setCustomerId(99999L); // Malicious spoof attempt - should be overwritten by principal.getId()
        createReq.setStartDate(startDate);
        createReq.setEndDate(endDate);
        createReq.setItems(List.of(item1, item2));

        MvcResult createResult = mockMvc.perform(post("/api/v1/rentals")
                        .with(user(customer1Principal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.rentalId").isNumber())
                .andExpect(jsonPath("$.data.customerId").value(customer1Id)) // Verified: customerId spoof prevented!
                .andExpect(jsonPath("$.data.status").value("PENDING_PAYMENT"))
                .andExpect(jsonPath("$.data.items", hasSize(2)))
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long rentalId = responseNode.path("data").path("rentalId").asLong();

        // Verify total amount = (25000 * 5) + (8000 * 5) = 125,000 + 40,000 = 165,000.00
        BigDecimal expectedTotal = new BigDecimal("165000.00");
        BigDecimal actualTotal = new BigDecimal(responseNode.path("data").path("totalAmount").asText());
        assertEquals(0, expectedTotal.compareTo(actualTotal));

        // 2. Reject duplicate equipment in the same rental request -> 409 Conflict
        RentalCreateRequest dupReq = new RentalCreateRequest();
        dupReq.setStartDate(LocalDate.now().plusDays(30));
        dupReq.setEndDate(LocalDate.now().plusDays(32));
        dupReq.setItems(List.of(
                new RentalItemRequest(equipment1Id, "DAILY", 1, new BigDecimal("2.00")),
                new RentalItemRequest(equipment1Id, "DAILY", 1, new BigDecimal("2.00")) // duplicate
        ));
        mockMvc.perform(post("/api/v1/rentals")
                        .with(user(customer1Principal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dupReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));

        // 3. Hourly Rental Constraint: start date != end date -> 400 Bad Request
        RentalCreateRequest hourlyBadReq = new RentalCreateRequest();
        hourlyBadReq.setStartDate(LocalDate.now().plusDays(35));
        hourlyBadReq.setEndDate(LocalDate.now().plusDays(36)); // different date!
        hourlyBadReq.setItems(List.of(
                new RentalItemRequest(equipment1Id, "HOURLY", 1, new BigDecimal("4.00"))
        ));
        mockMvc.perform(post("/api/v1/rentals")
                        .with(user(customer1Principal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(hourlyBadReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        // 4. Overlapping Booking Conflict Prevention (Date-Overlap Rule):
        // Customer 2 attempts to book Equipment 1 during dates overlapping with Customer 1 (startDate+1 to endDate-1)
        LocalDate overlapStart = startDate.plusDays(1);
        LocalDate overlapEnd = endDate.minusDays(1);

        RentalCreateRequest overlapReq = new RentalCreateRequest();
        overlapReq.setStartDate(overlapStart);
        overlapReq.setEndDate(overlapEnd);
        overlapReq.setItems(List.of(new RentalItemRequest(equipment1Id, "DAILY", 1, new BigDecimal("3.00"))));

        mockMvc.perform(post("/api/v1/rentals")
                        .with(user(customer2Principal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(overlapReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));

        // 5. Non-overlapping Future Booking succeeds:
        LocalDate futureStart = endDate.plusDays(2);
        LocalDate futureEnd = endDate.plusDays(5);

        RentalCreateRequest futureReq = new RentalCreateRequest();
        futureReq.setStartDate(futureStart);
        futureReq.setEndDate(futureEnd);
        futureReq.setItems(List.of(new RentalItemRequest(equipment1Id, "DAILY", 1, new BigDecimal("3.00"))));

        mockMvc.perform(post("/api/v1/rentals")
                        .with(user(customer2Principal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(futureReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.customerId").value(customer2Id));
    }

    @Test
    @DisplayName("Scenario 3: Customer Isolation, Role Boundaries, and Cross-Customer Access Prevention")
    void testCustomerOwnershipAndRoleBoundaries() throws Exception {
        LocalDate startDate = LocalDate.now().plusDays(40);
        LocalDate endDate = LocalDate.now().plusDays(45);

        // 1. Create rental for Customer 1
        RentalCreateRequest createReq = new RentalCreateRequest();
        createReq.setStartDate(startDate);
        createReq.setEndDate(endDate);
        createReq.setItems(List.of(new RentalItemRequest(equipment1Id, "DAILY", 1, new BigDecimal("5.00"))));

        MvcResult createResult = mockMvc.perform(post("/api/v1/rentals")
                        .with(user(customer1Principal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        long rental1Id = objectMapper.readTree(createResult.getResponse().getContentAsString()).path("data").path("rentalId").asLong();

        // 2. Customer 1 can access own rental via GET /api/v1/rentals/{id} -> 200 OK
        mockMvc.perform(get("/api/v1/rentals/" + rental1Id)
                        .with(user(customer1Principal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.rentalId").value(rental1Id))
                .andExpect(jsonPath("$.data.customerId").value(customer1Id));

        // 3. Customer 2 attempting to view Customer 1's rental -> 403 Forbidden!
        mockMvc.perform(get("/api/v1/rentals/" + rental1Id)
                        .with(user(customer2Principal)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        // 4. Customer 1 accesses personal rentals via GET /api/v1/rentals/my -> 200 OK
        mockMvc.perform(get("/api/v1/rentals/my")
                        .with(user(customer1Principal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));

        // 5. Customer forbidden from GET /api/v1/rentals (admin view) -> 403 Forbidden
        mockMvc.perform(get("/api/v1/rentals")
                        .with(user(customer1Principal)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        // 6. Staff / Manager / Admin can view all rentals -> 200 OK
        mockMvc.perform(get("/api/v1/rentals")
                        .with(user(staffPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // 7. Staff forbidden from POST /api/v1/rentals -> 403 Forbidden
        mockMvc.perform(post("/api/v1/rentals")
                        .with(user(staffPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("Scenario 4: Rental Cancellation, State Lifecycle, and Pickup Status Workflow")
    void testCancellationAndStatusWorkflow() throws Exception {
        LocalDate startDate = LocalDate.now().plusDays(50);
        LocalDate endDate = LocalDate.now().plusDays(55);

        // 1. Create rental for Customer 1
        RentalCreateRequest createReq = new RentalCreateRequest();
        createReq.setStartDate(startDate);
        createReq.setEndDate(endDate);
        createReq.setItems(List.of(new RentalItemRequest(equipment1Id, "DAILY", 1, new BigDecimal("5.00"))));

        MvcResult createResult = mockMvc.perform(post("/api/v1/rentals")
                        .with(user(customer1Principal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        long rentalId = objectMapper.readTree(createResult.getResponse().getContentAsString()).path("data").path("rentalId").asLong();

        // 2. Customer 2 cannot cancel Customer 1's rental -> 403 Forbidden
        mockMvc.perform(post("/api/v1/rentals/" + rentalId + "/cancel")
                        .with(user(customer2Principal)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        // 3. Customer forbidden from updating operational status directly -> 403 Forbidden
        RentalStatusUpdateRequest statusUpdateReq = new RentalStatusUpdateRequest("CONFIRMED");
        mockMvc.perform(patch("/api/v1/rentals/" + rentalId + "/status")
                        .with(user(customer1Principal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusUpdateReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        // 4. Manager confirms rental: PENDING_PAYMENT -> CONFIRMED
        mockMvc.perform(patch("/api/v1/rentals/" + rentalId + "/status")
                        .with(user(managerPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusUpdateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"));

        // 5. Staff records pickup: CONFIRMED -> ACTIVE (via /pickup or /status)
        mockMvc.perform(patch("/api/v1/rentals/" + rentalId + "/pickup")
                        .with(user(staffPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.pickupAt").isNotEmpty());

        // Verify equipment status changed to RENTED
        String equipStatus = jdbcTemplate.queryForObject("SELECT status FROM equipment WHERE equipment_id = ?", String.class, equipment1Id);
        assertEquals("RENTED", equipStatus);

        // 6. Active rentals cannot be cancelled -> 409 Conflict
        mockMvc.perform(post("/api/v1/rentals/" + rentalId + "/cancel")
                        .with(user(customer1Principal)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));

        // 7. Manager completes rental: ACTIVE -> COMPLETED
        RentalStatusUpdateRequest completeReq = new RentalStatusUpdateRequest("COMPLETED");
        mockMvc.perform(patch("/api/v1/rentals/" + rentalId + "/status")
                        .with(user(managerPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(completeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));

        // Verify equipment status returned to AVAILABLE
        String finalEquipStatus = jdbcTemplate.queryForObject("SELECT status FROM equipment WHERE equipment_id = ?", String.class, equipment1Id);
        assertEquals("AVAILABLE", finalEquipStatus);
    }

    @Test
    @DisplayName("Scenario 5: Unauthenticated Access Rejection")
    void testUnauthenticatedAccess() throws Exception {
        mockMvc.perform(get("/api/v1/rentals/my"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        mockMvc.perform(get("/api/v1/rentals/1"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        mockMvc.perform(get("/api/v1/rentals"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }
}
