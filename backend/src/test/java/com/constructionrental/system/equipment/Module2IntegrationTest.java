package com.constructionrental.system.equipment;

import com.constructionrental.system.category.dto.CategoryCreateRequest;
import com.constructionrental.system.category.dto.CategoryStatusUpdateRequest;
import com.constructionrental.system.category.dto.CategoryUpdateRequest;
import com.constructionrental.system.equipment.dto.EquipmentCreateRequest;
import com.constructionrental.system.equipment.dto.EquipmentStatusUpdateRequest;
import com.constructionrental.system.equipment.dto.EquipmentUpdateRequest;
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

import java.math.BigDecimal;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class Module2IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("1-5: Category CRUD, status toggle, and duplicate rejection")
    @WithMockUser(username = "manager@example.com", roles = {"MANAGER"})
    void testCategoryLifecycle() throws Exception {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        String categoryName = "Cat-" + uniqueSuffix;

        // 1. Create category
        CategoryCreateRequest createReq = new CategoryCreateRequest(categoryName, "Heavy equipment category");
        MvcResult createResult = mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.categoryName").value(categoryName))
                .andExpect(jsonPath("$.data.isActive").value(true))
                .andReturn();

        JsonNode catNode = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long categoryId = catNode.path("data").path("categoryId").asLong();

        // 2. Get category by ID
        mockMvc.perform(get("/api/v1/categories/" + categoryId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.categoryId").value(categoryId))
                .andExpect(jsonPath("$.data.categoryName").value(categoryName));

        // 3. Update category
        CategoryUpdateRequest updateReq = new CategoryUpdateRequest(categoryName + "-Updated", "Updated Description");
        mockMvc.perform(put("/api/v1/categories/" + categoryId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.categoryName").value(categoryName + "-Updated"))
                .andExpect(jsonPath("$.data.description").value("Updated Description"));

        // 4. Activate/deactivate category
        CategoryStatusUpdateRequest deactivateReq = new CategoryStatusUpdateRequest(false);
        mockMvc.perform(patch("/api/v1/categories/" + categoryId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deactivateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isActive").value(false));

        // 5. Duplicate category name rejected
        CategoryCreateRequest duplicateReq = new CategoryCreateRequest(categoryName + "-Updated", "Duplicate attempt");
        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateReq)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("6-15, 20-21: Equipment CRUD, status toggle, duplicate code rejection, rates, and search/filter")
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testEquipmentLifecycleAndFilters() throws Exception {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        String categoryName = "EquipCat-" + uniqueSuffix;

        // Create active category first
        CategoryCreateRequest catReq = new CategoryCreateRequest(categoryName, "For equipment testing");
        MvcResult catResult = mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(catReq)))
                .andExpect(status().isCreated())
                .andReturn();
        long categoryId = objectMapper.readTree(catResult.getResponse().getContentAsString()).path("data").path("categoryId").asLong();

        // 6. Create equipment
        String equipCode = "EQ-" + uniqueSuffix;
        EquipmentCreateRequest equipReq = new EquipmentCreateRequest(
                equipCode,
                "Heavy Bulldozer " + uniqueSuffix,
                categoryId,
                "Komatsu",
                "D375A",
                new BigDecimal("12500.00"),
                new BigDecimal("65000.00"),
                new BigDecimal("1200000.00"),
                "Colombo Port",
                true
        );

        MvcResult equipResult = mockMvc.perform(post("/api/v1/equipment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(equipReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.equipmentCode").value(equipCode))
                .andExpect(jsonPath("$.data.status").value("AVAILABLE"))
                .andExpect(jsonPath("$.data.isActive").value(true))
                .andReturn();

        long equipmentId = objectMapper.readTree(equipResult.getResponse().getContentAsString()).path("data").path("equipmentId").asLong();

        // 7. Get equipment
        mockMvc.perform(get("/api/v1/equipment/" + equipmentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.equipmentId").value(equipmentId))
                .andExpect(jsonPath("$.data.equipmentCode").value(equipCode));

        // 8. Update equipment
        EquipmentUpdateRequest updateReq = new EquipmentUpdateRequest(
                equipCode,
                "Heavy Bulldozer Updated",
                categoryId,
                "Komatsu",
                "D375A-8",
                new BigDecimal("13000.00"),
                new BigDecimal("70000.00"),
                new BigDecimal("1300000.00"),
                "Galle Yard",
                true
        );

        mockMvc.perform(put("/api/v1/equipment/" + equipmentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.equipmentName").value("Heavy Bulldozer Updated"))
                .andExpect(jsonPath("$.data.location").value("Galle Yard"));

        // 9. Activate/deactivate equipment (changes isActive, status remains AVAILABLE)
        EquipmentStatusUpdateRequest deactReq = new EquipmentStatusUpdateRequest(false);
        mockMvc.perform(patch("/api/v1/equipment/" + equipmentId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deactReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isActive").value(false))
                .andExpect(jsonPath("$.data.status").value("AVAILABLE"));

        // 10. Duplicate equipment code rejected
        EquipmentCreateRequest dupReq = new EquipmentCreateRequest(
                equipCode,
                "Duplicate Code Test",
                categoryId,
                "CAT",
                "320",
                new BigDecimal("5000.00"),
                null,
                null,
                "Colombo",
                false
        );
        mockMvc.perform(post("/api/v1/equipment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dupReq)))
                .andExpect(status().isConflict());

        // 11. Invalid category rejected
        EquipmentCreateRequest invalidCatReq = new EquipmentCreateRequest(
                "EQ-INVCAT-" + uniqueSuffix,
                "Invalid Cat Test",
                999999L,
                "CAT",
                "320",
                new BigDecimal("5000.00"),
                null,
                null,
                "Colombo",
                false
        );
        mockMvc.perform(post("/api/v1/equipment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidCatReq)))
                .andExpect(status().isBadRequest());

        // 12. Negative rate rejected
        EquipmentCreateRequest negRateReq = new EquipmentCreateRequest(
                "EQ-NEG-" + uniqueSuffix,
                "Negative Rate Test",
                categoryId,
                "CAT",
                "320",
                new BigDecimal("-500.00"),
                null,
                null,
                "Colombo",
                false
        );
        mockMvc.perform(post("/api/v1/equipment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(negRateReq)))
                .andExpect(status().isBadRequest());

        // Reactivate equipment for filter testing
        mockMvc.perform(patch("/api/v1/equipment/" + equipmentId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new EquipmentStatusUpdateRequest(true))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isActive").value(true));

        // 13. Search equipment
        mockMvc.perform(get("/api/v1/equipment?search=Bulldozer"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));

        // 14. Filter by category
        mockMvc.perform(get("/api/v1/equipment?categoryId=" + categoryId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));

        // 15. Filter by status
        mockMvc.perform(get("/api/v1/equipment?status=AVAILABLE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("16-17: Customer browsing rules: active visible, inactive hidden")
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testCustomerBrowsingRules() throws Exception {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        String categoryName = "CustRuleCat-" + uniqueSuffix;

        CategoryCreateRequest catReq = new CategoryCreateRequest(categoryName, "For customer visibility testing");
        MvcResult catResult = mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(catReq)))
                .andExpect(status().isCreated())
                .andReturn();
        long categoryId = objectMapper.readTree(catResult.getResponse().getContentAsString()).path("data").path("categoryId").asLong();

        // Create equipment
        String equipCode = "EQ-CUST-" + uniqueSuffix;
        EquipmentCreateRequest equipReq = new EquipmentCreateRequest(
                equipCode,
                "Customer Visibility Fleet",
                categoryId,
                "Hitachi",
                "ZX200",
                new BigDecimal("8000.00"),
                null,
                null,
                "Kandy",
                true
        );

        MvcResult equipResult = mockMvc.perform(post("/api/v1/equipment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(equipReq)))
                .andExpect(status().isCreated())
                .andReturn();
        long equipmentId = objectMapper.readTree(equipResult.getResponse().getContentAsString()).path("data").path("equipmentId").asLong();

        // 16. Customer can view active equipment
        mockMvc.perform(get("/api/v1/equipment/" + equipmentId)
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("cust").roles("CUSTOMER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.equipmentId").value(equipmentId));

        // Deactivate equipment
        mockMvc.perform(patch("/api/v1/equipment/" + equipmentId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new EquipmentStatusUpdateRequest(false))))
                .andExpect(status().isOk());

        // 17. Inactive equipment hidden from customer listing and detail
        mockMvc.perform(get("/api/v1/equipment/" + equipmentId)
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("cust").roles("CUSTOMER")))
                .andExpect(status().isNotFound());

        MvcResult customerListResult = mockMvc.perform(get("/api/v1/equipment?categoryId=" + categoryId)
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("cust").roles("CUSTOMER")))
                .andExpect(status().isOk())
                .andReturn();
        String listBody = customerListResult.getResponse().getContentAsString();
        assertFalse(listBody.contains(equipCode), "Inactive equipment must not appear in customer list response");

        // Staff can still see inactive equipment
        mockMvc.perform(get("/api/v1/equipment/" + equipmentId)
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("staff").roles("STAFF")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.equipmentId").value(equipmentId));
    }

    @Test
    @DisplayName("18-19, 22-23: Role permission enforcement: Staff, Manager, Admin, and Public")
    void testRolePermissions() throws Exception {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);

        // 18. STAFF can now create equipment (unified Staff role — 201 Created)
        EquipmentCreateRequest equipReq = new EquipmentCreateRequest(
                "EQ-STAFF-" + uniqueSuffix,
                "Staff Attempt",
                1L,
                "JCB",
                "3CX",
                new BigDecimal("6000.00"),
                null,
                null,
                "Galle",
                false
        );
        mockMvc.perform(post("/api/v1/equipment")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("staff").roles("STAFF"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(equipReq)))
                .andExpect(status().isCreated());

        // 19. STAFF can now manage categories (unified Staff role — 201 Created)
        CategoryCreateRequest catReq = new CategoryCreateRequest("StaffCat-" + uniqueSuffix, "Staff attempt");
        mockMvc.perform(post("/api/v1/categories")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("staff").roles("STAFF"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(catReq)))
                .andExpect(status().isCreated());

        // 22. Public read access is permitted for fleet browsing; unauthenticated mutations return 401
        mockMvc.perform(get("/api/v1/equipment"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(post("/api/v1/equipment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(equipReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(catReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        // 23. Forbidden requests return 403
        mockMvc.perform(put("/api/v1/categories/1")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("cust").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CategoryUpdateRequest("Hack", "Desc"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }
}
