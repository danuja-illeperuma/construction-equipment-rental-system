package com.constructionrental.system.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final String password;
    private final String name;
    private final String role;
    private final String accountType; // "USER" or "CUSTOMER"
    private final boolean isCustomer;
    private final String customerType;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Long id, String email, String password, String name, String role, boolean isCustomer) {
        this(id, email, password, name, role, isCustomer ? "CUSTOMER" : "USER", isCustomer, null);
    }

    public UserPrincipal(Long id, String email, String password, String name, String role,
                         String accountType, boolean isCustomer, String customerType) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.name = name;
        this.role = role;
        this.accountType = accountType;
        this.isCustomer = isCustomer;
        this.customerType = customerType;

        List<GrantedAuthority> auths = new ArrayList<>();
        if (role != null && !role.isBlank()) {
            String upperRole = role.toUpperCase();
            auths.add(new SimpleGrantedAuthority("ROLE_" + upperRole));
            auths.add(new SimpleGrantedAuthority(upperRole));
            // ADMIN inherits STAFF authorities for operations
            if ("ADMIN".equals(upperRole)) {
                auths.add(new SimpleGrantedAuthority("ROLE_STAFF"));
                auths.add(new SimpleGrantedAuthority("STAFF"));
            }
        }
        this.authorities = auths;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getRole() {
        return role;
    }

    public String getAccountType() {
        return accountType;
    }

    public boolean isCustomer() {
        return isCustomer;
    }

    public String getCustomerType() {
        return customerType;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
