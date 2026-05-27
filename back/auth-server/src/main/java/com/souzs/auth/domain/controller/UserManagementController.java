package com.souzs.auth.domain.controller;

import com.souzs.auth.domain.dto.AssignRolesRequest;
import com.souzs.auth.domain.dto.UserStatusRequest;
import com.souzs.auth.domain.dto.UserSummaryResponse;
import com.souzs.auth.domain.service.UserManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserManagementService userManagementService;

    @GetMapping
    public Page<UserSummaryResponse> findAll(Pageable pageable) {
        return userManagementService.findAll(pageable);
    }

    @GetMapping("/{id}")
    public UserSummaryResponse findById(@PathVariable Long id) {
        return userManagementService.findById(id);
    }

    @PutMapping("/{id}/roles")
    public UserSummaryResponse assignRoles(@PathVariable Long id, @Valid @RequestBody AssignRolesRequest request) {
        return userManagementService.assignRoles(id, request);
    }

    @PatchMapping("/{id}/status")
    public UserSummaryResponse updateStatus(@PathVariable Long id, @RequestBody UserStatusRequest request) {
        return userManagementService.updateStatus(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> disable(@PathVariable Long id) {
        userManagementService.disable(id);
        return ResponseEntity.noContent().build();
    }
}
