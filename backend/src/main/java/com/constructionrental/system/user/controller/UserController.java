package com.constructionrental.system.user.controller;

import com.constructionrental.system.common.dto.ApiResponse;
import com.constructionrental.system.user.dto.InternalUserCreateRequest;
import com.constructionrental.system.user.dto.InternalUserResponse;
import com.constructionrental.system.user.dto.UserStatusUpdateRequest;
import com.constructionrental.system.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InternalUserResponse>>> getAllUsers() {
        List<InternalUserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InternalUserResponse>> getUserById(@PathVariable Long id) {
        InternalUserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InternalUserResponse>> createUser(
            @Valid @RequestBody InternalUserCreateRequest request) {
        InternalUserResponse user = userService.createUser(request);
        return new ResponseEntity<>(ApiResponse.success(user, "User created successfully"), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<InternalUserResponse>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        
        if (!request.getIsActive() && userDetails instanceof com.constructionrental.system.security.UserPrincipal principal) {
            if (id.equals(principal.getId())) {
                throw new com.constructionrental.system.common.exception.BadRequestException("You cannot deactivate your own administrative account.");
            }
        }
        
        InternalUserResponse user = userService.updateStatus(id, request.getIsActive());
        return ResponseEntity.ok(ApiResponse.success(user, "User status updated successfully"));
    }
}
