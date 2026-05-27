package com.souzs.auth.domain.service;

import com.souzs.auth.domain.dto.AssignRolesRequest;
import com.souzs.auth.domain.dto.UserStatusRequest;
import com.souzs.auth.domain.dto.UserSummaryResponse;
import com.souzs.auth.domain.entity.Role;
import com.souzs.auth.domain.entity.User;
import com.souzs.auth.domain.repository.RoleRepository;
import com.souzs.auth.domain.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class UserManagementService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Transactional(readOnly = true)
    public Page<UserSummaryResponse> findAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserSummaryResponse::from);
    }

    @Transactional(readOnly = true)
    public UserSummaryResponse findById(Long id) {
        return userRepository.findById(id)
                .map(UserSummaryResponse::from)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado: " + id));
    }

    public UserSummaryResponse assignRoles(Long id, AssignRolesRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado: " + id));

        Set<Role> roles = new HashSet<>();
        for (String roleName : request.roleNames()) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new EntityNotFoundException("Role não encontrada: " + roleName));
            roles.add(role);
        }

        user.setRoles(roles);
        return UserSummaryResponse.from(user);
    }

    public UserSummaryResponse updateStatus(Long id, UserStatusRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado: " + id));

        if (request.enabled() != null) user.setEnabled(request.enabled());
        if (request.locked() != null) user.setLocked(request.locked());

        return UserSummaryResponse.from(user);
    }

    public void disable(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado: " + id));
        user.setEnabled(false);
    }
}
