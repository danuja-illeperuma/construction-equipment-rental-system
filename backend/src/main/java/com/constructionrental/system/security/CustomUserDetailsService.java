package com.constructionrental.system.security;

import com.constructionrental.system.customer.repository.CustomerRepository;
import com.constructionrental.system.customer.repository.CustomerSecurityModel;
import com.constructionrental.system.user.repository.UserRepository;
import com.constructionrental.system.user.repository.UserSecurityModel;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    public CustomUserDetailsService(UserRepository userRepository, CustomerRepository customerRepository) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        if (email == null) {
            throw new UsernameNotFoundException("Email cannot be null");
        }

        String normalizedEmail = email.trim().toLowerCase();

        // First check in internal users (Admin, Staff) who are active
        Optional<UserSecurityModel> userOpt = userRepository.findActiveByEmail(normalizedEmail);
        if (userOpt.isPresent()) {
            UserSecurityModel u = userOpt.get();
            return new UserPrincipal(
                    u.getUserId(),
                    u.getEmail(),
                    u.getPasswordHash(),
                    u.getFullName(),
                    u.getRole(),
                    "USER",
                    false,
                    null
            );
        }

        // If not found in internal users, check in active customers
        Optional<CustomerSecurityModel> customerOpt = customerRepository.findActiveByEmail(normalizedEmail);
        if (customerOpt.isPresent()) {
            CustomerSecurityModel c = customerOpt.get();
            return new UserPrincipal(
                    c.getCustomerId(),
                    c.getEmail(),
                    c.getPasswordHash(),
                    c.getName(),
                    "CUSTOMER",
                    "CUSTOMER",
                    true,
                    c.getCustomerType()
            );
        }

        throw new UsernameNotFoundException("Active account not found with email: " + email);
    }
}
