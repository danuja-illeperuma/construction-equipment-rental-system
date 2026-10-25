package com.constructionrental.system.user.service;

import com.constructionrental.system.common.exception.DuplicateResourceException;
import com.constructionrental.system.common.exception.ResourceNotFoundException;
import com.constructionrental.system.customer.repository.CustomerRepository;
import com.constructionrental.system.user.dto.InternalUserCreateRequest;
import com.constructionrental.system.user.dto.InternalUserResponse;
import com.constructionrental.system.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       CustomerRepository customerRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<InternalUserResponse> getAllUsers() {
        return userRepository.findAll();
    }

    public InternalUserResponse getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Internal user not found with id: " + id));
    }

    @Transactional
    public InternalUserResponse createUser(InternalUserCreateRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email is already registered for an internal user: " + email);
        }

        if (customerRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email is already registered for a customer account: " + email);
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        Long newUserId = userRepository.save(request, encodedPassword);

        return getUserById(newUserId);
    }

    @Transactional
    public InternalUserResponse updateStatus(Long id, boolean isActive) {
        getUserById(id); // Ensure user exists
        userRepository.updateStatus(id, isActive);
        return getUserById(id);
    }
}
