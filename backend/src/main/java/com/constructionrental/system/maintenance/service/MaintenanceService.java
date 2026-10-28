package com.constructionrental.system.maintenance.service;

import com.constructionrental.system.audit.service.AuditService;
import com.constructionrental.system.common.exception.BadRequestException;
import com.constructionrental.system.common.exception.ResourceNotFoundException;
import com.constructionrental.system.equipment.repository.EquipmentRepository;
import com.constructionrental.system.maintenance.dto.request.MaintenanceRequest;
import com.constructionrental.system.maintenance.dto.response.EquipmentMaintenanceSummaryResponse;
import com.constructionrental.system.maintenance.dto.response.MaintenanceResponse;
import com.constructionrental.system.maintenance.repository.MaintenanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final EquipmentRepository equipmentRepository;
    private final AuditService auditService;

    public MaintenanceService(MaintenanceRepository maintenanceRepository,
                              EquipmentRepository equipmentRepository,
                              AuditService auditService) {
        this.maintenanceRepository = maintenanceRepository;
        this.equipmentRepository = equipmentRepository;
        this.auditService = auditService;
    }

    public List<MaintenanceResponse> getAllMaintenance(String status, Long equipmentId) {
        return maintenanceRepository.findAll(status, equipmentId);
    }

    public List<MaintenanceResponse> getMaintenanceByEquipment(Long equipmentId) {
        // Validate equipment exists
        equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + equipmentId));
        return maintenanceRepository.findByEquipmentId(equipmentId);
    }

    public MaintenanceResponse getMaintenanceById(Long id) {
        return maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance record not found with ID: " + id));
    }

    @Transactional
    public MaintenanceResponse scheduleMaintenance(MaintenanceRequest request, Long staffUserId) {
        if (request.getNextMaintenanceDate() != null && !request.getNextMaintenanceDate().isAfter(LocalDate.now())) {
            throw new BadRequestException("Next due date must be after today. Only days after today are allowed.");
        }

        equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + request.getEquipmentId()));

        Long maintenanceId = maintenanceRepository.save(request, staffUserId != null ? staffUserId : 1L);

        // Audit log action
        auditService.logAction(staffUserId, "CREATE_MAINTENANCE", "maintenance_records", maintenanceId,
                "Scheduled " + request.getMaintenanceType() + " maintenance for equipment ID " + request.getEquipmentId());

        return getMaintenanceById(maintenanceId);
    }

    @Transactional
    public MaintenanceResponse updateMaintenance(Long id, MaintenanceRequest request) {
        getMaintenanceById(id); // Ensure exists
        maintenanceRepository.update(id, request);

        // Audit log action
        auditService.logAction(null, "UPDATE_MAINTENANCE", "maintenance_records", id,
                "Updated maintenance record ID " + id);

        return getMaintenanceById(id);
    }

    @Transactional
    public MaintenanceResponse completeMaintenance(Long id) {
        return completeMaintenance(id, null, null);
    }

    @Transactional
    public MaintenanceResponse completeMaintenance(Long id, String notes, BigDecimal actualCost) {
        MaintenanceResponse maintenance = getMaintenanceById(id);
        maintenanceRepository.completeMaintenance(id, notes, actualCost);

        // Audit log action
        auditService.logAction(null, "COMPLETE_MAINTENANCE", "maintenance_records", id,
                "Completed maintenance record ID " + id + " for equipment ID " + maintenance.getEquipmentId());

        return getMaintenanceById(id);
    }

    @Transactional
    public MaintenanceResponse startMaintenanceProgress(Long id, Long staffUserId) {
        MaintenanceResponse maintenance = getMaintenanceById(id);

        // 1. Set equipment status to MAINTENANCE using Member 2's stored procedure sp_update_equipment_status
        equipmentRepository.updateStatus(maintenance.getEquipmentId(), "MAINTENANCE");

        // 2. Update maintenance_records: set in-progress notes and mark handled by company
        String existingNotes = maintenance.getNotes() != null ? maintenance.getNotes() : "";
        String updatedNotes = existingNotes.contains("[IN_PROGRESS]")
                ? existingNotes
                : ("[IN_PROGRESS] Maintenance in progress in workshop. " + existingNotes).trim();

        maintenanceRepository.startProgress(id, updatedNotes);

        // 3. Audit log action
        auditService.logAction(staffUserId, "START_MAINTENANCE_PROGRESS", "maintenance_records", id,
                "Started maintenance work for equipment ID " + maintenance.getEquipmentId() + ". Payment handled by company.");

        return getMaintenanceById(id);
    }

    /**
     * Retrieves workshop dashboard summary using MySQL View `v_equipment_maintenance_summary`.
     */
    public List<EquipmentMaintenanceSummaryResponse> getMaintenanceSummary() {
        return maintenanceRepository.findEquipmentMaintenanceSummary();
    }

    /**
     * Computes maintenance cost for a machine using MySQL scalar function `calculate_equipment_maintenance_cost`.
     */
    public BigDecimal calculateMaintenanceCost(Long equipmentId, LocalDate startDate, LocalDate endDate) {
        equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + equipmentId));
        return maintenanceRepository.calculateEquipmentMaintenanceCost(equipmentId, startDate, endDate);
    }

    @Transactional
    public MaintenanceResponse markAsPaid(Long id, Long staffUserId) {
        return markAsPaid(id, null, staffUserId);
    }

    @Transactional
    public MaintenanceResponse markAsPaid(Long id, Long customerId, Long staffUserId) {
        getMaintenanceById(id); // Ensure exists
        maintenanceRepository.markAsPaid(id, customerId);

        auditService.logAction(staffUserId, "MARK_MAINTENANCE_PAID", "maintenance_records", id,
                "Marked maintenance record ID " + id + " as paid" + (customerId != null ? " for customer " + customerId : ""));

        return getMaintenanceById(id);
    }

    @Transactional
    public MaintenanceResponse markAsUnpaid(Long id, Long customerId, Long staffUserId) {
        getMaintenanceById(id); // Ensure exists
        maintenanceRepository.markAsUnpaid(id, customerId);

        auditService.logAction(staffUserId, "MARK_MAINTENANCE_UNPAID", "maintenance_records", id,
                "Marked maintenance record ID " + id + " as unpaid" + (customerId != null ? " for customer " + customerId : ""));

        return getMaintenanceById(id);
    }

    public com.constructionrental.system.maintenance.dto.response.CustomerMaintenanceSummaryResponse getCustomerMaintenanceSummary(Long customerId) {
        List<MaintenanceResponse> records = maintenanceRepository.findByCustomerId(customerId);
        BigDecimal totalCharges = maintenanceRepository.getTotalMaintenanceCharges(customerId);
        BigDecimal paidAmount = maintenanceRepository.getPaidMaintenanceTotal(customerId);
        BigDecimal outstandingAmount = maintenanceRepository.getUnpaidMaintenanceTotal(customerId);
        boolean hasOutstanding = outstandingAmount.compareTo(BigDecimal.ZERO) > 0;

        return new com.constructionrental.system.maintenance.dto.response.CustomerMaintenanceSummaryResponse(
                customerId, totalCharges, paidAmount, outstandingAmount, hasOutstanding, records
        );
    }

    public boolean hasUnpaidMaintenance(Long customerId) {
        return maintenanceRepository.hasUnpaidMaintenance(customerId);
    }

    public BigDecimal getUnpaidMaintenanceTotal(Long customerId) {
        return maintenanceRepository.getUnpaidMaintenanceTotal(customerId);
    }
}
