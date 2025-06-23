package com.bnqaccesorios.controller;

import com.bnqaccesorios.service.AuthService;
import com.bnqaccesorios.repository.UsuarioRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UsuarioRepository usuarioRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        String token = authService.register(
                request.getEmail(),
                request.getPassword(),
                request.getNombre(),
                request.getDireccion(),
                request.getTelefono()
        );
        return ResponseEntity.ok(new JwtResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String token = authService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(new JwtResponse(token));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("No autenticado");
        }
        Usuario usuario = usuarioRepository.findByEmail(authentication.getName()).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(404).body("Usuario no encontrado");
        }
        return ResponseEntity.ok(new UserInfoResponse(
            usuario.getId(),
            usuario.getEmail(),
            usuario.getNombre(),
            usuario.getRoles().stream().map(Rol::getNombre).toList()
        ));
    }

    @Data
    public static class RegisterRequest {
        private String email;
        private String password;
        private String nombre;
        private String direccion;
        private String telefono;
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class JwtResponse {
        private final String token;
    }

    @Data
    public static class UserInfoResponse {
        private final Long id;
        private final String email;
        private final String nombre;
        private final java.util.List<String> roles;
    }
} 