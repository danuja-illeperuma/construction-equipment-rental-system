# Module 4: Payment + Returns + Damage Documentation
## Construction Equipment Rental & Management System (CERMS)

This document provides a comprehensive technical reference for Module 4 of the Construction Equipment Rental & Management System (CERMS), hosted on Aiven MySQL 8.4 (`construction_rental`) with Spring Boot 3.3.4 (pure SQL / Spring JDBC) and a React + Vite + Tailwind CSS frontend.

---

## 1. Payment Table (`payments`)
The `payments` table stores upfront full payments for rental bookings.

```sql
CREATE TABLE `payments` (
  `payment_id` bigint NOT NULL AUTO_INCREMENT,
  `rental_id` bigint NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('PAYHERE','SIMULATED') NOT NULL,
  `payment_status` enum('PENDING','SUCCESS','FAILED','EXPIRED') NOT NULL DEFAULT 'PENDING',
  `transaction_reference` varchar(100) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `rental_id` (`rental_id`),
  UNIQUE KEY `transaction_reference` (`transaction_reference`),
  CONSTRAINT `fk_payment_rental` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`rental_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_payment_amount` CHECK ((`amount` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### Key Structural Rules:
- **`UNIQUE(rental_id)`**: Strictly enforces that there is exactly **one** payment record per rental. No duplicate rows can be created for any rental.
- **`amount`**: Must equal `rentals.total_amount`. Partial payments or installment payments are rejected by business rules and stored procedures.
- **`payment_status`**: Tracks payment states: `PENDING`, `SUCCESS`, `FAILED`, `EXPIRED`.
- **`UNIQUE(transaction_reference)`**: Ensures gateway and simulated transaction reference uniqueness.

---

## 2. Return Table (`equipment_returns`)
The `equipment_returns` table records the operational handover of rental items back to the depot by internal staff.

```sql
CREATE TABLE `equipment_returns` (
  `return_id` bigint NOT NULL AUTO_INCREMENT,
  `rental_item_id` bigint NOT NULL,
  `returned_at` datetime NOT NULL,
  `condition` enum('GOOD','DAMAGED') NOT NULL,
  `late_charge` decimal(10,2) NOT NULL DEFAULT '0.00',
  `notes` varchar(500) DEFAULT NULL,
  `recorded_by` bigint NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`return_id`),
  UNIQUE KEY `rental_item_id` (`rental_item_id`),
  KEY `fk_return_user` (`recorded_by`),
  CONSTRAINT `fk_return_rental_item` FOREIGN KEY (`rental_item_id`) REFERENCES `rental_items` (`rental_item_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_return_user` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_late_charge` CHECK ((`late_charge` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### Key Structural Rules:
- **`UNIQUE(rental_item_id)`**: Ensures each rental item can only be returned once. Duplicate returns are prevented at the schema level.
- **`condition`**: `GOOD` or `DAMAGED`. Determines equipment status upon check-in.
- **`late_charge`**: Overdue penalty calculated automatically by `calculate_late_charge()`.
- **`recorded_by`**: Foreign key to `users(user_id)` verifying that returns are executed by authorized internal staff.

---

## 3. Damage Report Table (`damage_reports`)
The `damage_reports` table records damage assessments for equipment returned in `DAMAGED` condition.

```sql
CREATE TABLE `damage_reports` (
  `damage_id` bigint NOT NULL AUTO_INCREMENT,
  `return_id` bigint NOT NULL,
  `description` varchar(500) NOT NULL,
  `damage_charge` decimal(10,2) NOT NULL DEFAULT '0.00',
  `reported_by` bigint NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`damage_id`),
  KEY `fk_damage_return` (`return_id`),
  KEY `fk_damage_user` (`reported_by`),
  CONSTRAINT `fk_damage_return` FOREIGN KEY (`return_id`) REFERENCES `equipment_returns` (`return_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_damage_user` FOREIGN KEY (`reported_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_damage_charge` CHECK ((`damage_charge` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### Key Structural Rules:
- Linked directly to `equipment_returns(return_id)`.
- `damage_charge >= 0` enforced by CHECK constraint `chk_damage_charge`.
- Reporting user must be an active internal user (`users`).

---

## 4. Late Charge Function (`calculate_late_charge`)
File: `database/functions/06_payment_return_functions.sql`

```sql
CREATE FUNCTION calculate_late_charge(
    p_rental_item_id BIGINT,
    p_returned_at DATETIME
)
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
```

### Mathematical & Business Formulation:
1. **Base Time**: Uses `rentals.pickup_at` (actual physical handover). If missing, falls back to `rentals.start_date`.
2. **Expected Return Time**:
   - `HOURLY`: $\text{expected} = \text{base\_time} + \text{duration} \text{ hours}$
   - `DAILY`: $\text{expected} = \text{base\_time} + \text{duration} \text{ days}$
   - `MONTHLY`: $\text{expected} = \text{base\_time} + \text{duration} \times 30 \text{ days}$
3. **On-time Return**:
   $$\text{If } p\_returned\_at \le \text{expected}, \quad \text{late\_charge} = 0.00$$
4. **Late Return Calculation (Ceiling Policy)**:
   $$\Delta t = \text{TIMESTAMPDIFF(SECOND, expected, returned)}$$
   $$\text{Units}_{\text{late}} = \left\lceil \frac{\Delta t}{\text{Unit Seconds}} \right\rceil$$
   Where Unit Seconds = 3600 (Hourly), 86400 (Daily), or $30 \times 86400$ (Monthly).
   $$\text{Late Charge} = \text{Units}_{\text{late}} \times \text{unit\_rate}$$

### Examples:
- A daily rental at LKR 14,000.00/day returned 1.5 hours late $\rightarrow \lceil 1.5 / 24 \rceil = 1 \text{ day} \rightarrow \text{LKR } 14,000.00$.
- A daily rental returned 25 hours late $\rightarrow \lceil 25 / 24 \rceil = 2 \text{ days} \rightarrow \text{LKR } 28,000.00$.
- A daily rental returned on time $\rightarrow \text{LKR } 0.00$.

---

## 5. Stored Procedures
File: `database/procedures/07_payment_return_procedures.sql`

### 1. `sp_create_payment(p_rental_id, p_payment_method, OUT p_payment_id)`
- Validates that the rental exists and is in `PENDING_PAYMENT` status.
- Validates that `total_amount > 0`.
- Enforces `UNIQUE(rental_id)`: Checks if a payment already exists.
  - If existing payment is `SUCCESS`, raises SQLSTATE 45000: `'Payment has already been completed for this rental'`.
  - If existing payment is `PENDING`, `FAILED`, or `EXPIRED`, reuses the row by updating method and status back to `PENDING`.
  - If no payment exists, inserts a new row with `amount = rentals.total_amount` and `payment_status = 'PENDING'`.
- Returns `p_payment_id`. Does not commit, preserving external transaction control.

### 2. `sp_process_payment(p_payment_id, p_payment_status, p_transaction_reference)`
- Acquires pessimistic lock on the payment row:
  `SELECT ... FROM payments WHERE payment_id = ? FOR UPDATE;`
- **Idempotency**: If `current_status = 'SUCCESS'`, returns cleanly without modifying records or raising errors.
- Acquires pessimistic lock on the associated rental:
  `SELECT ... FROM rentals WHERE rental_id = ? FOR UPDATE;`
- Validates that the rental is not in a terminal state (`CANCELLED`, `EXPIRED`, `COMPLETED`).
- Validates that `payment.amount == rental.total_amount`.
- Verifies `transaction_reference` uniqueness across other payments.
- When `p_payment_status = 'SUCCESS'`:
  - Sets `payment_status = 'SUCCESS'`, `paid_at = NOW()`, `transaction_reference = ?`.
  - If rental is in `PENDING_PAYMENT`, transitions rental to `CONFIRMED`.
- When `p_payment_status = 'FAILED'`:
  - Sets `payment_status = 'FAILED'`. Does not confirm rental.
- When `p_payment_status = 'EXPIRED'`:
  - Sets `payment_status = 'EXPIRED'`. Does not confirm rental.

### 3. `sp_process_return(p_rental_item_id, p_returned_at, p_condition, p_notes, p_recorded_by, OUT p_return_id, OUT p_late_charge)`
- Validates condition (`GOOD` or `DAMAGED`).
- Validates that the recording user is an active internal user.
- Locks rental item and associated rental row (`FOR UPDATE`).
- Verifies that rental is in `ACTIVE` state.
- Checks if the item has already been returned (`UNIQUE(rental_item_id)`).
- Locks the equipment row (`FOR UPDATE`).
- Executes `calculate_late_charge(p_rental_item_id, p_returned_at)` to obtain overdue charges.
- Inserts into `equipment_returns`.
- Updates equipment status:
  - If `GOOD` $\rightarrow$ `AVAILABLE`.
  - If `DAMAGED` $\rightarrow$ `MAINTENANCE`.
- Checks if all items for the rental have now been returned:
  - If unreturned item count = 0, transitions rental from `ACTIVE` to `COMPLETED`.

### 4. `sp_record_damage(p_return_id, p_description, p_damage_charge, p_reported_by, OUT p_damage_id)`
- Validates equipment return existence (`FOR UPDATE`).
- Validates non-empty description and `damage_charge >= 0`.
- Validates that reporting user is an active internal staff user.
- Inserts damage report into `damage_reports`.
- Ensures equipment status remains in `MAINTENANCE`.

---

## 6. Database Triggers
File: `database/triggers/08_payment_return_triggers.sql`

### 1. `trg_payments_after_update`
```sql
CREATE TRIGGER trg_payments_after_update
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    IF NEW.payment_status = 'SUCCESS' AND OLD.payment_status <> 'SUCCESS' THEN
        UPDATE rentals
        SET status = 'CONFIRMED'
        WHERE rental_id = NEW.rental_id
          AND status = 'PENDING_PAYMENT';
    END IF;
END
```
Guarantees database-level consistency so that any raw or direct update to `SUCCESS` automatically confirms the rental if it is pending payment.

### 2. `trg_equipment_returns_after_insert`
```sql
CREATE TRIGGER trg_equipment_returns_after_insert
AFTER INSERT ON equipment_returns
FOR EACH ROW
BEGIN
    DECLARE v_rental_id BIGINT;
    DECLARE v_equipment_id BIGINT;
    DECLARE v_unreturned_count INT DEFAULT 0;

    SELECT rental_id, equipment_id INTO v_rental_id, v_equipment_id
    FROM rental_items WHERE rental_item_id = NEW.rental_item_id;

    IF NEW.`condition` = 'GOOD' THEN
        UPDATE equipment SET status = 'AVAILABLE' WHERE equipment_id = v_equipment_id;
    ELSEIF NEW.`condition` = 'DAMAGED' THEN
        UPDATE equipment SET status = 'MAINTENANCE' WHERE equipment_id = v_equipment_id;
    END IF;

    SELECT COUNT(*) INTO v_unreturned_count
    FROM rental_items ri
    WHERE ri.rental_id = v_rental_id
      AND NOT EXISTS (
          SELECT 1 FROM equipment_returns er WHERE er.rental_item_id = ri.rental_item_id
      );

    IF v_unreturned_count = 0 THEN
        UPDATE rentals SET status = 'COMPLETED' WHERE rental_id = v_rental_id AND status = 'ACTIVE';
    END IF;
END
```
Enforces operational state synchronization for equipment and rental lifecycle completion.

---

## 7. Database Indexes
File: `database/indexes/module4_payment_return_indexes.sql`

### 1. Existing Index Analysis:
- `payments.PRIMARY`: (`payment_id`) $\rightarrow$ Primary key point lookups.
- `payments.rental_id`: `UNIQUE(rental_id)` $\rightarrow$ Fast $O(\log N)$ lookup by rental ID. A composite index on `(rental_id, payment_status)` is redundant because `rental_id` is already unique.
- `payments.transaction_reference`: `UNIQUE(transaction_reference)` $\rightarrow$ Fast gateway reconciliation.
- `equipment_returns.rental_item_id`: `UNIQUE(rental_item_id)` $\rightarrow$ Covers all point lookups for return checks.
- `damage_reports.return_id`: `KEY fk_damage_return (return_id)` $\rightarrow$ Covers lookups of damage reports by return.

### 2. Newly Created Composite Index:
```sql
CREATE INDEX idx_payments_status_created ON payments (payment_status, created_at);
```
- **Rationale**: Administrative queries (`GET /api/v1/payments?status=SUCCESS`) filter by `payment_status` and sort chronologically by `created_at DESC`. This composite index provides an index range scan eliminating table scans and temporary file-sorts.

---

## 8. Payment Lifecycle
```
[Rental Created]
       ↓
(PENDING_PAYMENT)
       ↓
[Initiate Payment: sp_create_payment]
       ↓
(Payment: PENDING)
       ├───► [Payment Succeeded] ──► (Payment: SUCCESS) ──► (Rental: CONFIRMED)
       ├───► [Payment Failed]    ──► (Payment: FAILED)  ──► (Rental remains PENDING_PAYMENT)
       └───► [Payment Expired]   ──► (Payment: EXPIRED) ──► (Rental remains PENDING_PAYMENT / EXPIRED)
```

---

## 9. Return Lifecycle
```
(Rental: CONFIRMED)
       ↓
[Equipment Pickup: PATCH /pickup]
       ↓
(Rental: ACTIVE) & (Equipment: RENTED)
       ↓
[Staff Process Return: sp_process_return]
       ├─── Calculate Late Charge: calculate_late_charge()
       ├─── Check Condition:
       │       ├── GOOD    ──► Equipment: AVAILABLE
       │       └── DAMAGED ──► Equipment: MAINTENANCE
       └─── Check All Items Returned:
               ├── Unreturned items > 0 ──► Rental remains ACTIVE
               └── All items returned   ──► Rental becomes COMPLETED
```

---

## 10. Damage Lifecycle
```
(Equipment Returned as DAMAGED)
       ↓
(Equipment: MAINTENANCE)
       ↓
[Staff Logs Damage: sp_record_damage]
       ├── Validates description & damage_charge >= 0
       ├── Inserts damage_reports row
       └── Enforces Equipment remains in MAINTENANCE
```

---

## 11. Transaction Strategy
All operations are wrapped in Spring `@Transactional` service methods:
- **Payment Processing**:
  1. Lock payment row (`FOR UPDATE`).
  2. Lock associated rental row (`FOR UPDATE`).
  3. Validate amounts and states.
  4. Update payment status.
  5. Confirm rental.
  6. Commit on success; rollback on any validation exception.
- **Return Handover**:
  1. Lock rental item and rental (`FOR UPDATE`).
  2. Lock equipment (`FOR UPDATE`).
  3. Compute late charge.
  4. Insert return record.
  5. Update equipment status.
  6. Check completion count and update rental.
  7. Commit on success; rollback on failure.

---

## 12. PayHere Sandbox Flow (Plan A)
1. Customer initiates payment: `POST /api/v1/payments` with `PAYHERE`.
2. Frontend receives payment record and prepares checkout parameters (`merchant_id`, `order_id`, `amount`, `currency`).
3. Customer completes sandbox payment on PayHere popup/redirect.
4. PayHere server issues an asynchronous IPN notification to `POST /api/v1/payments/payhere/notify`.
5. Backend verifies:
   - Required parameters (`order_id`, `status_code`, `payment_id`).
   - MD5 hash signature: `strtoupper(md5(merchant_id + order_id + amount + currency + status_code + strtoupper(md5(secret))))`.
   - Reported amount matches rental amount.
6. Backend calls `sp_process_payment()` to transition payment to `SUCCESS` and rental to `CONFIRMED`.

---

## 13. Simulated Payment Flow (Plan B)
For local testing and automated CI/CD without an external network connection:
1. Customer or internal user calls `POST /api/v1/payments/{id}/simulate` or `POST /api/v1/payments/simulate`.
2. Backend validates that rental belongs to the customer (if customer role).
3. Backend generates a unique transaction reference `SIM-<timestamp>-<UUID>`.
4. Backend executes `sp_process_payment()` through the exact same database procedure, ensuring full behavioral parity with PayHere.

---

## 14. Security & Role Permissions
- **CUSTOMER**:
  - May initiate payment only for their **own** rental (`rental.customer_id == principal.id`).
  - May view only their own payments (`GET /api/v1/payments/{id}`, `GET /api/v1/payments/my`).
  - **Forbidden (403)** from processing equipment returns (`POST /api/v1/returns`).
  - **Forbidden (403)** from logging damage reports (`POST /api/v1/damage-reports`).
  - **Forbidden (403)** from viewing other customers' payments or the full payments list.
- **STAFF**:
  - May view all payments, process equipment returns, log damage reports, and view return/damage history.
- **MANAGER & ADMIN**:
  - Full access to payment, return, and damage endpoints.

---

## 15. Idempotency Strategy
- Stored procedure `sp_process_payment` checks if `payment_status` is already `SUCCESS`.
- If a duplicate IPN webhook notification or simulated payment call arrives with the same transaction reference, the procedure returns immediately without updating timestamps or creating duplicate records.
- Schema constraint `UNIQUE(transaction_reference)` prevents conflicting transactions from being recorded under the same ID.

---

## 16. EXPLAIN & Query Optimization Analysis
1. **Filtering Payments by Status and Date**:
   ```sql
   EXPLAIN SELECT p.payment_id, p.rental_id, p.amount, p.payment_status, p.created_at
   FROM payments p
   WHERE p.payment_status = 'SUCCESS'
   ORDER BY p.created_at DESC;
   ```
   - **Index Used**: `idx_payments_status_created` (`ref`).
   - **Benefit**: Avoids full table scans (`ALL`) and eliminates file sorts (`Using filesort`).
2. **Return Lookup by Rental Item**:
   ```sql
   EXPLAIN SELECT er.return_id, er.rental_item_id, er.returned_at, er.condition, er.late_charge
   FROM equipment_returns er
   WHERE er.rental_item_id = 5;
   ```
   - **Index Used**: `rental_item_id` (`const`).
   - **Benefit**: $O(1)$ constant time lookup.

---

## 17. Test Suite Summary
- **Database SQL Suite (`database/tests/09_module4_payment_return_tests.sql`)**: 21 SQL test cases.
- **Spring Boot Integration Test Suite (`com.constructionrental.system.payment.Module4IntegrationTest`)**:
  - Payment initiation and pending status.
  - Simulated payment and rental confirmation.
  - Customer ownership protection and 403 Forbidden enforcement.
  - Duplicate payment prevention and row reuse.
  - On-time return processing with 0.00 late charge.
  - Late return processing and ceiling calculation.
  - Damaged return check-in and damage report creation.
  - Multi-item partial return vs full completion.
  - Role restrictions for Customers vs Staff.

---

## Architecture Flow Diagram
```
React Frontend (Vite + Tailwind)
       │
   (Axios HTTP / JSON)
       ▼
Spring Boot REST Controller
       │
   (DTO Validation & PreAuthorize)
       ▼
Service Layer (@Transactional)
       │
   (Role Checks & Business Orchestration)
       ▼
Spring JDBC Repository (JdbcTemplate)
       │
   (Hand-written SQL & CallableStatement)
       ▼
MySQL 8.4 Stored Routines & Triggers
(sp_create_payment, sp_process_payment, sp_process_return, sp_record_damage, calculate_late_charge)
       ▼
Aiven MySQL Database (construction_rental)
```
