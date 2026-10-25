package com.constructionrental.system.maintenance;

import com.constructionrental.system.maintenance.dto.request.MaintenanceCompleteRequest;
import com.constructionrental.system.maintenance.dto.request.MaintenanceRequest;
import com.constructionrental.system.security.JwtTokenProvider;
import com.constructionrental.system.security.UserPrincipal;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class Module5IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private Long customerId;
    private String customerToken;

    private Long staffId;
    private String staffToken;

    private Long managerId;
    private String managerToken;

    private Long adminId;
    private String adminToken;

    private Long categoryId;
    private Long equipmentId;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);

        // 1. Customer
        String custEmail = "m5cust_" + suffix + "@cerms.test";
        String custPhone = "071" + ((long) (Math.random() * 9000000L + 1000000L));
        jdbcTemplate.update("""
            INSERT INTO customers (name, email, phone, nic_or_br_number, customer_type, address, password_hash, is_active)
            VALUES (?, ?, ?, ?, 'INDIVIDUAL', 'Colombo 07', '$2a$10$dummyHashDummmyHashDummyHash', 1)
            """, "M5 Cust " + suffix, custEmail, custPhone, "NIC-" + suffix);
        customerId = jdbcTemplate.queryForObject("SELECT customer_id FROM customers WHERE email = ?", Long.class, custEmail);
        UserPrincipal customerPrincipal = new UserPrincipal(customerId, custEmail, "pass", "M5 Cust", "CUSTOMER", "CUSTOMER", true, "INDIVIDUAL");
        customerToken = jwtTokenProvider.generateToken(customerPrincipal);

        // 2. Staff
        String staffEmail = "m5staff_" + suffix + "@cerms.test";
        jdbcTemplate.update("""
            INSERT INTO users (full_name, email, password_hash, role, is_active)
            VALUES (?, ?, '$2a$10$dummyHashDummmyHashDummyHash', 'STAFF', 1)
            """, "M5 Staff " + suffix, staffEmail);
        staffId = jdbcTemplate.queryForObject("SELECT user_id FROM users WHERE email = ?", Long.class, staffEmail);
        UserPrincipal staffPrincipal = new UserPrincipal(staffId, staffEmail, "pass", "M5 Staff", "STAFF", "USER", false, null);
        staffToken = jwtTokenProvider.generateToken(staffPrincipal);

        // 3. Manager
        String managerEmail = "m5mgr_" + suffix + "@cerms.test";
        jdbcTemplate.update("""
            INSERT INTO users (full_name, email, password_hash, role, is_active)
            VALUES (?, ?, '$2a$10$dummyHashDummmyHashDummyHash', 'MANAGER', 1)
            """, "M5 Mgr " + suffix, managerEmail);
        managerId = jdbcTemplate.queryForObject("SELECT user_id FROM users WHERE email = ?", Long.class, managerEmail);
        UserPrincipal managerPrincipal = new UserPrincipal(managerId, managerEmail, "pass", "M5 Mgr", "MANAGER", "USER", false, null);
        managerToken = jwtTokenProvider.generateToken(managerPrincipal);

        // 4. Admin
        String adminEmail = "m5admin_" + suffix + "@cerms.test";
        jdbcTemplate.update("""
            INSERT INTO users (full_name, email, password_hash, role, is_active)
            VALUES (?, ?, '$2a$10$dummyHashDummmyHashDummyHash', 'ADMIN', 1)
            """, "M5 Admin " + suffix, adminEmail);
        adminId = jdbcTemplate.queryForObject("SELECT user_id FROM users WHERE email = ?", Long.class, adminEmail);
        UserPrincipal adminPrincipal = new UserPrincipal(adminId, adminEmail, "pass", "M5 Admin", "ADMIN", "USER", false, null);
        adminToken = jwtTokenProvider.generateToken(adminPrincipal);

        // 5. Category & Equipment
        jdbcTemplate.update("""
            INSERT INTO equipment_categories (category_name, description, is_active)
            VALUES (?, 'Test Category M5', 1)
            """, "M5 Cat " + suffix);
        categoryId = jdbcTemplate.queryForObject("SELECT category_id FROM equipment_categories WHERE category_name = ?", Long.class, "M5 Cat " + suffix);

        String eqCode = "EQ-M5INT-" + suffix.toUpperCase();
        jdbcTemplate.update("""
            INSERT INTO equipment (category_id, equipment_code, equipment_name, daily_rate, status, is_active)
            VALUES (?, ?, 'M5 Test Excavator', 35000.00, 'AVAILABLE', 1)
            """, categoryId, eqCode);
        equipmentId = jdbcTemplate.queryForObject("SELECT equipment_id FROM equipment WHERE equipment_code = ?", Long.class, eqCode);
    }

    @Test
    @DisplayName("Test 1: Staff schedules maintenance -> Equipment becomes MAINTENANCE & Audit log created")
    void testScheduleMaintenanceByStaff() throws Exception {
        MaintenanceRequest request = new MaintenanceRequest();
        request.setEquipmentId(equipmentId);
        request.setMaintenanceType("ROUTINE");
        request.setMaintenanceDate(LocalDate.now());
        request.setMaintenanceCost(new BigDecimal("15000.00"));
        request.setDescription("Hydraulic system 500-hour service");
        request.setNextMaintenanceDate(LocalDate.now().plusMonths(3));

        mockMvc.perform(post("/api/v1/maintenance")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.equipmentId").value(equipmentId))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.maintenanceType").value("ROUTINE"));

        // Verify equipment status changed to MAINTENANCE
        String eqStatus = jdbcTemplate.queryForObject(
                "SELECT status FROM equipment WHERE equipment_id = ?", String.class, equipmentId);
        assertEquals("MAINTENANCE", eqStatus);

        // Verify audit log exists
        Integer auditCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM audit_logs WHERE table_name = 'maintenance_records' AND action = 'CREATE_MAINTENANCE'",
                Integer.class);
        assertNotNull(auditCount);
        assertTrue(auditCount > 0);
    }

    @Test
    @DisplayName("Test 2: Customer scheduling maintenance is Forbidden (403)")
    void testCustomerForbiddenFromSchedulingMaintenance() throws Exception {
        MaintenanceRequest request = new MaintenanceRequest();
        request.setEquipmentId(equipmentId);
        request.setMaintenanceType("ROUTINE");
        request.setMaintenanceDate(LocalDate.now());
        request.setMaintenanceCost(new BigDecimal("5000.00"));
        request.setDescription("Attempted by customer");

        mockMvc.perform(post("/api/v1/maintenance")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Test 3: Complete maintenance -> Equipment restored to AVAILABLE & cost updated")
    void testCompleteMaintenance() throws Exception {
        // Schedule maintenance
        MaintenanceRequest request = new MaintenanceRequest();
        request.setEquipmentId(equipmentId);
        request.setMaintenanceType("REPAIR");
        request.setMaintenanceDate(LocalDate.now());
        request.setMaintenanceCost(new BigDecimal("12000.00"));
        request.setDescription("Alternator repair");

        String respStr = mockMvc.perform(post("/api/v1/maintenance")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long maintId = objectMapper.readTree(respStr).path("data").path("maintenanceId").asLong();

        // Complete maintenance
        MaintenanceCompleteRequest completeRequest = new MaintenanceCompleteRequest("Replaced rotor and tested ok", new BigDecimal("14500.00"));

        mockMvc.perform(patch("/api/v1/maintenance/" + maintId + "/complete")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(completeRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.maintenanceCost").value(14500.00));

        // Verify equipment status restored to AVAILABLE
        String eqStatus = jdbcTemplate.queryForObject(
                "SELECT status FROM equipment WHERE equipment_id = ?", String.class, equipmentId);
        assertEquals("AVAILABLE", eqStatus);

        // Verify audit log
        Integer auditCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM audit_logs WHERE table_name = 'maintenance_records' AND action = 'COMPLETE_MAINTENANCE' AND record_id = ?",
                Integer.class, maintId);
        assertNotNull(auditCount);
        assertTrue(auditCount > 0);
    }

    @Test
    @DisplayName("Test 4: Get equipment maintenance history endpoints")
    void testGetEquipmentMaintenanceHistory() throws Exception {
        // Schedule one record
        MaintenanceRequest request = new MaintenanceRequest();
        request.setEquipmentId(equipmentId);
        request.setMaintenanceType("ROUTINE");
        request.setMaintenanceDate(LocalDate.now());
        request.setMaintenanceCost(new BigDecimal("8000.00"));
        request.setDescription("Oil change");

        mockMvc.perform(post("/api/v1/maintenance")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Test GET /api/v1/maintenance/equipment/{id}
        mockMvc.perform(get("/api/v1/maintenance/equipment/" + equipmentId)
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));

        // Test GET /api/v1/equipment/{id}/maintenance
        mockMvc.perform(get("/api/v1/equipment/" + equipmentId + "/maintenance")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("Test 5: Reports accessible to MANAGER and ADMIN")
    void testReportsAccessibleToManagerAndAdmin() throws Exception {
        // Manager accesses reports
        mockMvc.perform(get("/api/v1/reports/revenue")
                        .header("Authorization", "Bearer " + managerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.netRevenue").exists());

        mockMvc.perform(get("/api/v1/reports/equipment")
                        .header("Authorization", "Bearer " + managerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/v1/reports/equipment-performance")
                        .header("Authorization", "Bearer " + managerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());

        mockMvc.perform(get("/api/v1/reports/maintenance-cost")
                        .header("Authorization", "Bearer " + managerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/v1/reports/payment-summary")
                        .header("Authorization", "Bearer " + managerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/v1/reports/damage-summary")
                        .header("Authorization", "Bearer " + managerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Admin also has full access
        mockMvc.perform(get("/api/v1/reports/revenue")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Test 6: Reports available to STAFF and blocked for CUSTOMER")
    void testReportsBlockedForStaffAndCustomer() throws Exception {
        // Staff should have access under the new unified role rules
        mockMvc.perform(get("/api/v1/reports/revenue")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/reports/equipment-performance")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk());

        // Customer blocked (403)
        mockMvc.perform(get("/api/v1/reports/revenue")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/reports/maintenance-cost")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Test 7: Audit logs accessible to MANAGER & ADMIN, blocked for STAFF & CUSTOMER")
    void testAuditLogsRbac() throws Exception {
        // Manager allowed
        mockMvc.perform(get("/api/v1/audit-logs")
                        .header("Authorization", "Bearer " + managerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());

        // Admin allowed
        mockMvc.perform(get("/api/v1/audit-logs")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Staff blocked
        mockMvc.perform(get("/api/v1/audit-logs")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isForbidden());

        // Customer blocked
        mockMvc.perform(get("/api/v1/audit-logs")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Test 8: Database Function calculate_equipment_maintenance_cost execution")
    void testDatabaseFunction() {
        // Insert a completed maintenance record
        jdbcTemplate.update("""
            INSERT INTO maintenance_records (equipment_id, maintenance_type, maintenance_date, maintenance_cost, status, description, recorded_by)
            VALUES (?, 'ROUTINE', CURDATE(), 25000.00, 'COMPLETED', 'Function test', ?)
            """, equipmentId, staffId);

        BigDecimal cost = jdbcTemplate.queryForObject(
                "SELECT calculate_equipment_maintenance_cost(?, NULL, NULL)", BigDecimal.class, equipmentId);
        assertNotNull(cost);
        assertTrue(cost.compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    @DisplayName("Test 9: Database Views verification")
    void testDatabaseViews() {
        // v_equipment_maintenance_summary
        Integer v1Count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM v_equipment_maintenance_summary WHERE equipment_id = ?",
                Integer.class, equipmentId);
        assertNotNull(v1Count);
        assertEquals(1, v1Count);

        // v_equipment_performance
        Integer v3Count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM v_equipment_performance WHERE equipment_id = ?",
                Integer.class, equipmentId);
        assertNotNull(v3Count);
        assertEquals(1, v3Count);
    }
}
