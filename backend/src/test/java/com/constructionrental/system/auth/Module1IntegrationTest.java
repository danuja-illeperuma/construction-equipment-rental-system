package com.constructionrental.system.auth;

import com.constructionrental.system.auth.dto.request.LoginRequest;
import com.constructionrental.system.customer.dto.CustomerProfileUpdateRequest;
import com.constructionrental.system.customer.dto.CustomerRegisterRequest;
import com.constructionrental.system.customer.dto.CustomerStatusUpdateRequest;
import com.constructionrental.system.user.dto.InternalUserCreateRequest;
import com.constructionrental.system.user.dto.UserStatusUpdateRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class Module1IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("Should successfully register a customer, login, access /me, and update profile")
    void testCustomerLifecycle() throws Exception {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        String email = "testcust_" + uniqueSuffix + "@example.com";
        String phone = "07" + ((long) (Math.random() * 90000000L + 10000000L));
        String password = "Password123!";

        // 1. Register Customer
        CustomerRegisterRequest registerReq = new CustomerRegisterRequest();
        registerReq.setName("Test Customer " + uniqueSuffix);
        registerReq.setEmail(email);
        registerReq.setPhone(phone);
        registerReq.setNicOrBrNumber("NIC-" + uniqueSuffix);
        registerReq.setCustomerType("INDIVIDUAL");
        registerReq.setAddress("123 Test Street, Colombo");
        registerReq.setPassword(password);

        MvcResult regResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value(email))
                .andExpect(jsonPath("$.data.customerType").value("INDIVIDUAL"))
                .andExpect(jsonPath("$.data.address").value("123 Test Street, Colombo"))
                .andExpect(jsonPath("$.data.passwordHash").doesNotExist())
                .andReturn();

        JsonNode regNode = objectMapper.readTree(regResult.getResponse().getContentAsString());
        long customerId = regNode.path("data").path("customerId").asLong();

        // 2. Login with valid credentials
        LoginRequest loginReq = new LoginRequest(email, password);
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.data.accountType").value("CUSTOMER"))
                .andExpect(jsonPath("$.data.isCustomer").value(true))
                .andReturn();

        JsonNode loginNode = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String token = loginNode.path("data").path("token").asText();

        // 3. Access /api/v1/auth/me with Bearer token
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value(email))
                .andExpect(jsonPath("$.data.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.data.isCustomer").value(true));

        // 4. Access /api/v1/customers/me
        mockMvc.perform(get("/api/v1/customers/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.customerId").value(customerId));

        // 5. Update Profile via PUT /api/v1/customers/me
        CustomerProfileUpdateRequest updateReq = new CustomerProfileUpdateRequest();
        updateReq.setName("Updated Customer Name");
        updateReq.setPhone(phone);
        updateReq.setNicOrBrNumber("NIC-" + uniqueSuffix);
        updateReq.setAddress("456 Updated Lane, Kandy");

        mockMvc.perform(put("/api/v1/customers/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Updated Customer Name"))
                .andExpect(jsonPath("$.data.address").value("456 Updated Lane, Kandy"));

        // 6. Customer attempting to access Admin endpoint /api/v1/users should receive 403 Forbidden
        mockMvc.perform(get("/api/v1/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    @DisplayName("Should reject invalid login credentials with 401 Unauthorized")
    void testInvalidLoginCredentials() throws Exception {
        LoginRequest badLogin = new LoginRequest("nonexistent_user@example.com", "WrongPassword123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    @DisplayName("Should reject unauthenticated access to protected endpoints with 401")
    void testUnauthenticatedAccess() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        mockMvc.perform(get("/api/v1/customers/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("Admin should be able to create internal users, list users, and update status")
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testAdminUserManagement() throws Exception {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        String userEmail = "staff_" + uniqueSuffix + "@constructionrental.lk";
        String phone = "071" + ((long) (Math.random() * 9000000L + 1000000L));

        InternalUserCreateRequest createReq = new InternalUserCreateRequest(
                "Internal Staff " + uniqueSuffix,
                userEmail,
                "StaffPassword123!",
                "STAFF",
                phone
        );

        // 1. Create Internal User
        MvcResult createResult = mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value(userEmail))
                .andExpect(jsonPath("$.data.role").value("STAFF"))
                .andExpect(jsonPath("$.data.isActive").value(true))
                .andReturn();

        JsonNode userNode = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long createdUserId = userNode.path("data").path("userId").asLong();

        // 2. Get User By ID
        mockMvc.perform(get("/api/v1/users/" + createdUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.userId").value(createdUserId))
                .andExpect(jsonPath("$.data.email").value(userEmail));

        // 3. List All Users
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));

        // 4. Update User Status to Inactive
        UserStatusUpdateRequest deactivateReq = new UserStatusUpdateRequest(false);
        mockMvc.perform(patch("/api/v1/users/" + createdUserId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deactivateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isActive").value(false));

        // 5. Restore User Status to Active
        UserStatusUpdateRequest activateReq = new UserStatusUpdateRequest(true);
        mockMvc.perform(patch("/api/v1/users/" + createdUserId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(activateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isActive").value(true));
    }

    @Test
    @DisplayName("Manager or Admin should be able to update customer status")
    @WithMockUser(username = "manager@example.com", roles = {"MANAGER"})
    void testCustomerStatusManagement() throws Exception {
        // Register customer first through unauthenticated call
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        String email = "status_test_" + uniqueSuffix + "@example.com";
        String phone = "072" + ((long) (Math.random() * 9000000L + 1000000L));

        CustomerRegisterRequest registerReq = new CustomerRegisterRequest();
        registerReq.setName("Status Customer " + uniqueSuffix);
        registerReq.setEmail(email);
        registerReq.setPhone(phone);
        registerReq.setNicOrBrNumber("NIC-" + uniqueSuffix);
        registerReq.setCustomerType("COMPANY");
        registerReq.setAddress("Industrial Zone, Biyagama");
        registerReq.setPassword("CompanyPass123!");

        MvcResult regResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode regNode = objectMapper.readTree(regResult.getResponse().getContentAsString());
        long customerId = regNode.path("data").path("customerId").asLong();

        // Update status as MANAGER
        CustomerStatusUpdateRequest deactivate = new CustomerStatusUpdateRequest(false);
        mockMvc.perform(patch("/api/v1/customers/" + customerId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deactivate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isActive").value(false));
    }

    @Test
    @DisplayName("Should reject malformed/non-compact JWS token with 401 Unauthorized")
    void testMalformedCompactJwsTokenRejected() throws Exception {
        // Reproduces the exact invalid compact JWS string pattern: demo-jwt-token-<timestamp>
        String fakeToken = "demo-jwt-token-1741023901";

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + fakeToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("Staff user should login with valid credentials and receive valid 3-part compact JWT")
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testStaffLoginFlow() throws Exception {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        String staffEmail = "staff_" + uniqueSuffix + "@constructionrental.lk";
        String password = "StaffPassword123!";

        // 1. Create Staff User as ADMIN
        InternalUserCreateRequest createReq = new InternalUserCreateRequest(
                "Staff " + uniqueSuffix,
                staffEmail,
                password,
                "STAFF",
                "071" + ((long) (Math.random() * 9000000L + 1000000L))
        );
        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated());

        // 2. Login with credentials
        LoginRequest loginReq = new LoginRequest(staffEmail, password);
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("STAFF"))
                .andExpect(jsonPath("$.data.isCustomer").value(false))
                .andReturn();

        JsonNode loginNode = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String token = loginNode.path("data").path("token").asText();
        assertTrue(token != null && !token.isEmpty(), "Token should not be empty");
        // Compact JWS must contain exactly 2 period characters (3 parts)
        assertEquals(2, token.chars().filter(ch -> ch == '.').count(), "Valid compact JWT must contain exactly 2 periods");

        // 3. Access /api/v1/auth/me with Bearer token
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value(staffEmail))
                .andExpect(jsonPath("$.data.role").value("STAFF"))
                .andExpect(jsonPath("$.data.isCustomer").value(false));
    }

    @Test
    @DisplayName("Staff and Admin users should login with valid credentials and receive valid compact JWTs")
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testManagerAndAdminLoginFlow() throws Exception {
        String suffixStaff = UUID.randomUUID().toString().substring(0, 8);
        String staffEmail2 = "staff2_" + suffixStaff + "@constructionrental.lk";
        String staffPassword2 = "StaffPassword123!";

        // 1a. Verify that creating a MANAGER account is now rejected (MANAGER role removed from new creation)
        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new InternalUserCreateRequest(
                                "LegacyMgr " + suffixStaff, "legacymgr_" + suffixStaff + "@constructionrental.lk",
                                "MgrPassword123!", "MANAGER", "0711111111"))))
                .andExpect(status().isBadRequest());

        // 1b. Create Staff user as ADMIN (replaces former MANAGER creation)
        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new InternalUserCreateRequest(
                                "Staff2 " + suffixStaff, staffEmail2, staffPassword2, "STAFF", "0711111111"))))
                .andExpect(status().isCreated());

        // 2. Verify that creating an Admin as ADMIN via API is rejected (Admin creation restricted)
        String suffixAdmin = UUID.randomUUID().toString().substring(0, 8);
        String adminEmail = "admin_" + suffixAdmin + "@constructionrental.lk";
        String adminPassword = "AdminPassword123!";

        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new InternalUserCreateRequest(
                                "Admin " + suffixAdmin, adminEmail, adminPassword, "ADMIN", "0722222222"))))
                .andExpect(status().isBadRequest());

        // 3. Login as Staff (was previously Manager — same test flow, new role)
        MvcResult staffLoginRes = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(staffEmail2, staffPassword2))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("STAFF"))
                .andReturn();

        String staffToken2 = objectMapper.readTree(staffLoginRes.getResponse().getContentAsString()).path("data").path("token").asText();
        assertEquals(2, staffToken2.chars().filter(ch -> ch == '.').count(), "Staff token must have 2 periods");

        // 4. Staff accesses /api/v1/customers (Staff has this permission)
        mockMvc.perform(get("/api/v1/customers")
                        .header("Authorization", "Bearer " + staffToken2))
                .andExpect(status().isOk());

        // 5. Login as an existing Admin (presentation account)
        MvcResult adminLoginRes = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("admin@cerms.lk", "Admin@Cerms123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("ADMIN"))
                .andReturn();

        String adminToken = objectMapper.readTree(adminLoginRes.getResponse().getContentAsString()).path("data").path("token").asText();
        assertEquals(2, adminToken.chars().filter(ch -> ch == '.').count(), "Admin token must have 2 periods");

        // 6. Admin accesses /api/v1/users
        mockMvc.perform(get("/api/v1/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Verify that NO accounts with @demo.com exist in users or customers tables")
    void testVerifyNoDemoAccountsExist() {
        int userDemoCount = 0;
        int custDemoCount = 0;
        try {
            userDemoCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM users WHERE email LIKE '%@demo.com'", Integer.class);
            custDemoCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM customers WHERE email LIKE '%@demo.com'", Integer.class);
        } catch (Exception e) {
            try { Thread.sleep(500); } catch (InterruptedException ignored) {}
            userDemoCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM users WHERE email LIKE '%@demo.com'", Integer.class);
            custDemoCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM customers WHERE email LIKE '%@demo.com'", Integer.class);
        }
        assertEquals(0, userDemoCount, "No user accounts should use @demo.com");
        assertEquals(0, custDemoCount, "No customer accounts should use @demo.com");
    }

    @Test
    @DisplayName("1. Admin presentation login -> SUCCESS with valid 3-part compact JWT")
    void testPresentationAdminLogin() throws Exception {
        MvcResult res = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("admin@cerms.lk", "Admin@Cerms123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("ADMIN"))
                .andExpect(jsonPath("$.data.isCustomer").value(false))
                .andReturn();

        String token = objectMapper.readTree(res.getResponse().getContentAsString()).path("data").path("token").asText();
        assertNotNull(token);
        assertEquals(2, token.chars().filter(ch -> ch == '.').count(), "JWT must have exactly 2 periods");

        mockMvc.perform(get("/api/v1/users").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("2. Manager presentation login -> SUCCESS with valid 3-part compact JWT")
    void testPresentationManagerLogin() throws Exception {
        MvcResult res = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("manager@cerms.lk", "Manager@Cerms123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("MANAGER"))
                .andExpect(jsonPath("$.data.isCustomer").value(false))
                .andReturn();

        String token = objectMapper.readTree(res.getResponse().getContentAsString()).path("data").path("token").asText();
        assertNotNull(token);
        assertEquals(2, token.chars().filter(ch -> ch == '.').count(), "JWT must have exactly 2 periods");

        mockMvc.perform(get("/api/v1/customers").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("3. Staff presentation login -> SUCCESS with valid 3-part compact JWT")
    void testPresentationStaffLogin() throws Exception {
        MvcResult res = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("staff@cerms.lk", "Staff@Cerms123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("STAFF"))
                .andExpect(jsonPath("$.data.isCustomer").value(false))
                .andReturn();

        String token = objectMapper.readTree(res.getResponse().getContentAsString()).path("data").path("token").asText();
        assertNotNull(token);
        assertEquals(2, token.chars().filter(ch -> ch == '.').count(), "JWT must have exactly 2 periods");

        mockMvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("staff@cerms.lk"))
                .andExpect(jsonPath("$.data.role").value("STAFF"));
    }

    @Test
    @DisplayName("4. Customer presentation login -> SUCCESS with valid 3-part compact JWT")
    void testPresentationCustomerLogin() throws Exception {
        MvcResult res = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("customer@cerms.lk", "Customer@Cerms123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.data.isCustomer").value(true))
                .andReturn();

        String token = objectMapper.readTree(res.getResponse().getContentAsString()).path("data").path("token").asText();
        assertNotNull(token);
        assertEquals(2, token.chars().filter(ch -> ch == '.').count(), "JWT must have exactly 2 periods");

        mockMvc.perform(get("/api/v1/customers/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("customer@cerms.lk"));
    }

    @Test
    @DisplayName("5. Invalid password -> 401 Unauthorized")
    void testInvalidPasswordReturns401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("admin@cerms.lk", "WrongPassword!"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    @DisplayName("6. Nonexistent account -> 401 Unauthorized")
    void testNonexistentAccountReturns401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("nonexistent@cerms.lk", "SomePassword123!"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    @DisplayName("7. Role-based endpoint restrictions enforced (Customer, Staff, Manager)")
    void testRoleBasedEndpointRestrictions() throws Exception {
        // Customer cannot access /api/v1/users
        MvcResult custRes = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("customer@cerms.lk", "Customer@Cerms123"))))
                .andExpect(status().isOk()).andReturn();
        String custToken = objectMapper.readTree(custRes.getResponse().getContentAsString()).path("data").path("token").asText();

        mockMvc.perform(get("/api/v1/users").header("Authorization", "Bearer " + custToken))
                .andExpect(status().isForbidden());

        // Staff cannot access /api/v1/users
        MvcResult staffRes = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("staff@cerms.lk", "Staff@Cerms123"))))
                .andExpect(status().isOk()).andReturn();
        String staffToken = objectMapper.readTree(staffRes.getResponse().getContentAsString()).path("data").path("token").asText();

        mockMvc.perform(get("/api/v1/users").header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isForbidden());

        // Manager cannot access admin-only /api/v1/users
        MvcResult mgrRes = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("manager@cerms.lk", "Manager@Cerms123"))))
                .andExpect(status().isOk()).andReturn();
        String mgrToken = objectMapper.readTree(mgrRes.getResponse().getContentAsString()).path("data").path("token").asText();

        mockMvc.perform(get("/api/v1/users").header("Authorization", "Bearer " + mgrToken))
                .andExpect(status().isForbidden());
    }
}
