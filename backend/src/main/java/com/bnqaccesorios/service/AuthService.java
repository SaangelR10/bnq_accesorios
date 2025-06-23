package com.bnqaccesorios.service;

import com.bnqaccesorios.model.Rol;
import com.bnqaccesorios.model.Usuario;
import com.bnqaccesorios.repository.RolRepository;
import com.bnqaccesorios.repository.UsuarioRepository;
import com.bnqaccesorios.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public String register(String email, String password, String nombre, String direccion, String telefono) {
        if (usuarioRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("El email ya está registrado");
        }
        Rol rolUser = rolRepository.findByNombre("USER")
                .orElseGet(() -> rolRepository.save(new Rol(null, "USER")));
        Usuario usuario = new Usuario();
        usuario.setEmail(email);
        usuario.setPassword(passwordEncoder.encode(password));
        usuario.setNombre(nombre);
        usuario.setDireccion(direccion);
        usuario.setTelefono(telefono);
        usuario.setRoles(Collections.singleton(rolUser));
        usuarioRepository.save(usuario);
        return jwtUtil.generateToken(email);
    }

    public String login(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return jwtUtil.generateToken(email);
    }
} 