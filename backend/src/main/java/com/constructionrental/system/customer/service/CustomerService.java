package com.constructionrental.system.customer.service;

import com.constructionrental.system.common.exception.DuplicateResourceException;
import com.constructionrental.system.common.exception.ResourceNotFoundException;
import com.constructionrental.system.customer.dto.CustomerProfileUpdateRequest;
import com.constructionrental.system.customer.dto.CustomerResponse;
import com.constructionrental.system.customer.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<CustomerResponse> getAllCustomers() {
        List<CustomerResponse> customers = customerRepository.findAll();
        for (CustomerResponse c : customers) {
            c.setTotalBookings(customerRepository.getCustomerBookingCount(c.getCustomerId()));
        }
        return customers;
    }

    public CustomerResponse getCustomerById(Long id) {
        CustomerResponse customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        customer.setTotalBookings(customerRepository.getCustomerBookingCount(id));
        return customer;
    }

    @Transactional
    public CustomerResponse updateProfile(Long id, CustomerProfileUpdateRequest request) {
        CustomerResponse existing = getCustomerById(id);

        // Check if phone number is being changed and is already taken
        if (!request.getPhone().equals(existing.getPhone()) && customerRepository.existsByPhoneAndNotId(request.getPhone(), id)) {
            throw new DuplicateResourceException("Phone number is already in use by another account: " + request.getPhone());
        }

        customerRepository.updateProfile(id, request);
        return getCustomerById(id);
    }

    @Transactional
    public CustomerResponse updateStatus(Long id, boolean isActive) {
        // Ensure customer exists
        getCustomerById(id);
        customerRepository.updateStatus(id, isActive);
        return getCustomerById(id);
    }
}
