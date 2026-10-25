package com.constructionrental.system.auth.service;

import com.constructionrental.system.auth.dto.request.LoginRequest;
import com.constructionrental.system.auth.dto.response.LoginResponse;
import com.constructionrental.system.auth.dto.response.MeResponse;
import com.constructionrental.system.common.exception.DuplicateResourceException;
import com.constructionrental.system.common.exception.ResourceNotFoundException;
import com.constructionrental.system.customer.dto.CustomerRegisterRequest;
import com.constructionrental.system.customer.dto.CustomerResponse;
import com.constructionrental.system.customer.repository.CustomerRepository;
import com.constructionrental.system.customer.repository.CustomerSecurityModel;
import com.constructionrental.system.security.JwtTokenProvider;
import com.constructionrental.system.security.UserPrincipal;
import com.constructionrental.system.user.dto.InternalUserResponse;
import com.constructionrental.system.user.repository.UserRepository;
import com.constructionrental.system.user.repository.UserSecurityModel;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       CustomerRepository customerRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public LoginResponse login(LoginRequest loginRequest) {
        String email = loginRequest.getEmail().trim().toLowerCase();
        String password = loginRequest.getPassword();

        // 1. Check internal users (users table)
        Optional<UserSecurityModel> userOpt = userRepository.findActiveByEmail(email);
        if (userOpt.isPresent()) {
            UserSecurityModel user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPasswordHash())) {
                UserPrincipal principal = new UserPrincipal(
                        user.getUserId(),
                        user.getEmail(),
                        user.getPasswordHash(),
                        user.getFullName(),
                        user.getRole(),
                        "USER",
                        false,
                        null
                );
                String jwt = tokenProvider.generateToken(principal);
                return new LoginResponse(
                        jwt,
                        user.getUserId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole(),
                        "USER",
                        false,
                        null
                );
            }
        }

        // 2. Check customers (customers table)
        Optional<CustomerSecurityModel> customerOpt = customerRepository.findActiveByEmail(email);
        if (customerOpt.isPresent()) {
            CustomerSecurityModel customer = customerOpt.get();
            if (passwordEncoder.matches(password, customer.getPasswordHash())) {
                UserPrincipal principal = new UserPrincipal(
                        customer.getCustomerId(),
                        customer.getEmail(),
                        customer.getPasswordHash(),
                        customer.getName(),
                        "CUSTOMER",
                        "CUSTOMER",
                        true,
                        customer.getCustomerType()
                );
                String jwt = tokenProvider.generateToken(principal);
                return new LoginResponse(
                        jwt,
                        customer.getCustomerId(),
                        customer.getName(),
                        customer.getEmail(),
                        "CUSTOMER",
                        "CUSTOMER",
                        true,
                        customer.getCustomerType()
                );
            }
        }

        // Generic error message for both non-existent users, inactive users, and incorrect passwords
        throw new BadCredentialsException("Invalid email or password");
    }

    @Transactional
    public CustomerResponse registerCustomer(CustomerRegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String phone = request.getPhone() != null ? request.getPhone().trim() : null;

        if (customerRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email is already registered: " + email);
        }

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email is already registered for an internal user: " + email);
        }

        if (phone != null && !phone.isBlank() && customerRepository.existsByPhone(phone)) {
            throw new DuplicateResourceException("Phone number is already registered: " + phone);
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        Long customerId = customerRepository.save(request, encodedPassword);

        return customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Failed to load registered customer with id: " + customerId));
    }

    public MeResponse getMe(UserPrincipal principal) {
        if (principal == null) {
            throw new BadCredentialsException("No authenticated principal found");
        }

        if (principal.isCustomer()) {
            CustomerResponse customer = customerRepository.findById(principal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer account not found"));
            return new MeResponse(
                    customer.getCustomerId(),
                    customer.getName(),
                    customer.getEmail(),
                    "CUSTOMER",
                    "CUSTOMER",
                    true,
                    customer.getCustomerType(),
                    customer.getPhone(),
                    customer.getAddress(),
                    customer.getNicOrBrNumber(),
                    customer.getCreatedAt()
            );
        } else {
            InternalUserResponse user = userRepository.findById(principal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User account not found"));
            return new MeResponse(
                    user.getUserId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getRole(),
                    "USER",
                    false,
                    null,
                    user.getPhone(),
                    null,
                    null,
                    user.getCreatedAt()
            );
        }
    }
}
