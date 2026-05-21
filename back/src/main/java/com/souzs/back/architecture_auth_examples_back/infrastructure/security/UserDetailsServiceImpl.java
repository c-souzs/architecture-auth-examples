package com.souzs.back.architecture_auth_examples_back.infrastructure.security;

import com.souzs.back.architecture_auth_examples_back.domain.auth.entity.User;
import com.souzs.back.architecture_auth_examples_back.domain.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Usado exclusivamente pelo AuthenticationManager no login para verificar credenciais.
// Authorities não são carregadas aqui — o SecurityContextHolder é populado pelo
// JwtAuthFilter com os claims do AT, que é a fonte real para hasAuthority/hasRole.
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // AuthenticationManager só precisa de credenciais.
        // user.getRoles().stream()
        //     .flatMap(role -> {
        //         var roleAuthority = new SimpleGrantedAuthority("ROLE_" + role.getName());
        //         var granularAuthorities = role.getAuthorities().stream()
        //                 .map(a -> new SimpleGrantedAuthority(a.getName()));
        //         return Stream.concat(Stream.of(roleAuthority), granularAuthorities);
        //     })
        //     .distinct()
        //     .toList();

        // Java nao tem 'as' para lidar com imports de itens parecidos
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(List.of())
                .accountExpired(false)
                .accountLocked(user.isLocked())
                .credentialsExpired(false)
                .disabled(!user.isEnabled())
                .build();
    }
}
