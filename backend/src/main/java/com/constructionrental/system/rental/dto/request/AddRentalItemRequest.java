package com.constructionrental.system.rental.dto.request;

import java.math.BigDecimal;

public class AddRentalItemRequest extends RentalItemRequest {
    public AddRentalItemRequest() {
        super();
    }

    public AddRentalItemRequest(Long equipmentId, String rentalType, Integer quantity, BigDecimal duration) {
        super(equipmentId, rentalType, quantity, duration);
    }
}
