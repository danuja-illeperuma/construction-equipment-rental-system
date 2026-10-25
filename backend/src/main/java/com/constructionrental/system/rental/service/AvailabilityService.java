package com.constructionrental.system.rental.service;

import com.constructionrental.system.common.exception.BadRequestException;
import com.constructionrental.system.common.exception.ResourceNotFoundException;
import com.constructionrental.system.equipment.dto.response.EquipmentResponse;
import com.constructionrental.system.equipment.repository.EquipmentRepository;
import com.constructionrental.system.rental.dto.request.AvailabilityRequest;
import com.constructionrental.system.rental.dto.response.AvailabilityResponse;
import com.constructionrental.system.rental.repository.RentalRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class AvailabilityService {

    private final RentalRepository rentalRepository;
    private final EquipmentRepository equipmentRepository;

    public AvailabilityService(RentalRepository rentalRepository, EquipmentRepository equipmentRepository) {
        this.rentalRepository = rentalRepository;
        this.equipmentRepository = equipmentRepository;
    }

    /**
     * Reusable availability checking service method.
     * Checks date validity, equipment active status, non-maintenance status,
     * and date-overlap collision with other non-terminated bookings.
     */
    public AvailabilityResponse checkAvailability(AvailabilityRequest request) {
        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();

        if (startDate == null || endDate == null) {
            throw new BadRequestException("Start date and end date are required");
        }

        if (endDate.isBefore(startDate)) {
            throw new BadRequestException("End date cannot be before start date");
        }

        List<Long> equipmentIds = request.getEquipmentIds();
        if (equipmentIds == null || equipmentIds.isEmpty()) {
            throw new BadRequestException("At least one equipment ID is required");
        }

        List<Long> conflictingIds = new ArrayList<>();

        for (Long equipId : equipmentIds) {
            // Validate equipment exists
            EquipmentResponse equipment = equipmentRepository.findById(equipId)
                    .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + equipId));

            // Validate equipment is active
            if (equipment.getIsActive() != null && !equipment.getIsActive()) {
                throw new BadRequestException("Equipment " + equipment.getEquipmentName() + " (ID: " + equipId + ") is inactive and cannot be rented");
            }

            // Validate equipment is not under MAINTENANCE
            if ("MAINTENANCE".equalsIgnoreCase(equipment.getStatus())) {
                throw new BadRequestException("Equipment " + equipment.getEquipmentName() + " (ID: " + equipId + ") is currently under maintenance and cannot be rented");
            }

            boolean isAvailable = rentalRepository.checkEquipmentAvailability(
                    equipId,
                    startDate,
                    endDate,
                    request.getExcludeRentalId()
            );

            if (!isAvailable) {
                conflictingIds.add(equipId);
            }
        }

        boolean available = conflictingIds.isEmpty();
        String message = available
                ? "All equipment items are available for the selected dates."
                : "Equipment items " + conflictingIds + " are already booked for the overlapping period.";

        return new AvailabilityResponse(available, conflictingIds, message);
    }
}
