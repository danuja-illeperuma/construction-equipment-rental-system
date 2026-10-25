# Module 3: Rental & Availability Architecture & Workflow

## Overview
This document describes the complete end-to-end architecture and request-response lifecycle for **Module 3: Rental & Availability** in the Construction Equipment Rental & Management System (CERMS).

---

## Complete Request Flow

```
React (Frontend)
   │ (HTTP POST with JSON payload + JWT Bearer token)
   ▼
RentalController (REST Controller)
   │ Validates DTO annotations (@Valid), verifies role authorization (@PreAuthorize)
   ▼
RentalService (Business Logic Layer)
   │ Orchestrates atomic @Transactional boundary, validates customer identity,
   │ locks equipment rows, checks availability, calculates totals
   ▼
RentalRepository (Data Access Layer - Pure Spring JDBC)
   │ Formulates parameterized SQL and CallableStatements
   ▼
Stored Procedures / Hand-Written SQL
   │ sp_create_rental, sp_add_rental_item, row-level locks (FOR UPDATE),
   │ calculate_rental_amount() function
   ▼
Aiven MySQL 8.4 (Database Engine)
   │ Enforces primary/foreign keys, uniqueness constraints, before-insert triggers
   ▼
RowMappers & Data Projection
   │ RentalRowMapper & RentalItemRowMapper project ResultSet columns
   ▼
DTO Layer
   │ Wraps domain models into RentalResponse, RentalItemResponse, ApiResponse<T>
   ▼
JSON Serialization
   │ Jackson serializes objects to JSON with ISO-8601 timestamps
   ▼
React (Client State & UI)
   │ Axios interceptor unwraps response, updates React state, navigates to booking confirmation
```

---

## Detailed Step-by-Step Flow: Rental Booking

### 1. React UI Layer
- Customer navigates through `EquipmentCatalog.jsx` and adds equipment to the rental cart.
- On `RentalBooking.jsx`, the user specifies:
  - Rental Type (`HOURLY`, `DAILY`, `MONTHLY`)
  - Quantity and Duration
  - Start Date and End Date
- Before submission, `rentalApi.checkAvailability()` sends an availability check request:
  ```json
  {
    "equipmentIds": [1, 2],
    "startDate": "2026-10-15",
    "endDate": "2026-10-20"
  }
  ```
- Upon confirmation, `rentalApi.createRental()` is triggered with the payload:
  ```json
  {
    "startDate": "2026-10-15",
    "endDate": "2026-10-20",
    "items": [
      { "equipmentId": 1, "rentalType": "DAILY", "quantity": 1, "duration": 5.0 },
      { "equipmentId": 2, "rentalType": "DAILY", "quantity": 1, "duration": 5.0 }
    ]
  }
  ```

### 2. Spring Security & Controller Layer
- The HTTP request reaches `RentalController.createRental()`.
- `JwtAuthenticationFilter` validates the Bearer token, extracts the subject, and authenticates the request as `UserPrincipal`.
- `@PreAuthorize("hasAnyRole('CUSTOMER', 'MANAGER', 'ADMIN')")` enforces role restrictions:
  - If a `STAFF` member calls this endpoint, Spring Security intercepts and returns `403 Forbidden`.
  - Unauthenticated requests receive `401 Unauthorized`.
- `@Valid` triggers Bean validation on `RentalCreateRequest`:
  - `startDate` and `endDate` must not be null.
  - `items` list must not be empty.
  - Sub-items are validated (`quantity >= 1`, `duration > 0`).

### 3. Service Layer (`RentalService.java`)
- Executes within an atomic `@Transactional` boundary.
- **Identity Isolation:**
  - If the caller is a `CUSTOMER`, `customerId` is resolved directly from `principal.getId()`. Any `customerId` provided in the JSON body is ignored to prevent identity spoofing.
  - If `MANAGER` or `ADMIN`, allows creating a rental on behalf of a specific customer ID.
- **Pre-flight Validations:**
  - End date must not precede start date.
  - Customer must exist and have `is_active = 1`.
  - Check for duplicate equipment IDs within the same request (rejected with `409 Conflict`).
  - Hourly rental constraint: `start_date` must equal `end_date` because the database schema tracks date boundaries.
- **Header Generation:**
  - Generates a unique reference: `BK-YYYYMMDD-XXXXX`.
  - Calculates `payment_deadline` (now + 2 hours).
  - Calls `rentalRepository.createRentalHeader(...)` to insert the header in `PENDING_PAYMENT` with `total_amount = 0.00`.

### 4. Concurrency Protection & Item Insertion
- Loops over each `RentalItemRequest`:
  1. **Row Lock:** Executes `SELECT equipment_id FROM equipment WHERE equipment_id = ? FOR UPDATE`. This serializes any concurrent transactions attempting to book the same equipment.
  2. **Fleet Validation:** Confirms equipment is active and not under `MAINTENANCE`.
  3. **Overlap Query:**
     ```sql
     SELECT COUNT(*)
     FROM rental_items ri
     JOIN rentals r ON r.rental_id = ri.rental_id
     WHERE ri.equipment_id = ?
       AND r.status IN ('PENDING_PAYMENT', 'CONFIRMED', 'ACTIVE')
       AND r.start_date <= :endDate
       AND r.end_date >= :startDate
       AND r.rental_id <> :currentRentalId;
     ```
     If `COUNT(*) > 0`, throws `ConflictException("Equipment is not available for the selected dates")`.
     **Transaction Rollback:** Because `@Transactional` is active, throwing this unchecked exception immediately triggers a rollback of the rental header and any previously inserted items.
  4. **Amount Calculation:** Resolves rates and invokes the database function `calculate_rental_amount(quantity, duration, unitRate)`.
  5. **Item Insertion:** Inserts line item into `rental_items`.
  6. Accumulates `totalAmount`.
- Updates `rentals.total_amount` with the final summed total.

### 5. Repository & RowMapper Projection
- Calls `RentalRepository.findById(rentalId)` and `RentalItemRepository.findByRentalId(rentalId)`.
- `RentalRowMapper` and `RentalItemRowMapper` project the SQL result sets into `RentalResponse` and `RentalItemResponse` DTOs.
- `ApiResponse.success(rentalResponse, "Rental booking created with status PENDING_PAYMENT")` wraps the payload.

### 6. Client Receipt & UI State Update
- The controller returns HTTP `201 Created`.
- React receives the JSON response via `rentalApi.createRental()`.
- The user is redirected to `RentalDetail.jsx` or `PaymentCheckout.jsx` displaying the `PENDING_PAYMENT` status, booking reference, payment deadline, itemized costs, and instructions for payment.

---

## Operational State Machine

```
                   ┌──────────────┐
                   │ (Submitted)  │
                   └──────┬───────┘
                          │
                          ▼
               ┌───────────────────────┐
               │    PENDING_PAYMENT    │
               └──┬─────────┬─────────┬┘
                  │         │         │ (Customer/Staff cancel)
   (Payment done) │         │         ▼
                  │         │   ┌───────────┐
                  │         │   │ CANCELLED │  [Terminal]
                  │         │   └───────────┘
                  │         │ (Deadline expired)
                  │         ▼
                  │   ┌───────────┐
                  │   │  EXPIRED  │            [Terminal]
                  │   └───────────┘
                  ▼
          ┌───────────────┐
          │   CONFIRMED   │
          └──┬─────────┬──┘
             │         │ (Cancellation before handover)
             │         ▼
             │   ┌───────────┐
             │   │ CANCELLED │                 [Terminal]
             │   └───────────┘
(Pickup handover)
             ▼
          ┌───────────────┐
          │    ACTIVE     │  (Equipment marked 'RENTED')
          └──┬────────────┘
             │ (Equipment returned & inspected)
             ▼
          ┌───────────────┐
          │   COMPLETED   │  (Equipment returned to 'AVAILABLE') [Terminal]
          └───────────────┘
```

---

## Security & Permission Matrix

| Operation | Path | Customer | Staff | Manager | Admin |
|---|---|:---:|:---:|:---:|:---:|
| Check Availability | `POST /api/v1/rentals/availability` | ✅ | ✅ | ✅ | ✅ |
| Create Rental Booking | `POST /api/v1/rentals` | ✅ (Own ID) | ❌ | ✅ | ✅ |
| View Rental Details | `GET /api/v1/rentals/{id}` | ✅ (Own Only) | ✅ | ✅ | ✅ |
| View Personal Rentals | `GET /api/v1/rentals/my` | ✅ | ❌ | ❌ | ❌ |
| View All Rentals | `GET /api/v1/rentals` | ❌ | ✅ | ✅ | ✅ |
| Cancel Rental | `POST /api/v1/rentals/{id}/cancel` | ✅ (Own Only) | ❌ | ✅ | ✅ |
| Update Status / Pickup | `PATCH /api/v1/rentals/{id}/status` | ❌ | ✅ | ✅ | ✅ |
| Record Pickup Handover | `PATCH /api/v1/rentals/{id}/pickup` | ❌ | ✅ | ✅ | ✅ |
