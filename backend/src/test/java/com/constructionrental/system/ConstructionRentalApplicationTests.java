package com.constructionrental.system;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class ConstructionRentalApplicationTests {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void contextLoads() {
        assertNotNull(jdbcTemplate, "JdbcTemplate should be wired");
        Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        assertTrue(result != null && result == 1, "Database connectivity test failed");
    }
}
