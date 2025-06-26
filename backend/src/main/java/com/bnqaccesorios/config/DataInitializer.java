package com.bnqaccesorios.config;

import com.bnqaccesorios.model.Rol;
import com.bnqaccesorios.model.Usuario;
import com.bnqaccesorios.repository.RolRepository;
import com.bnqaccesorios.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired
    private RolRepository rolRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Crear roles si no existen
        Rol rolUser = rolRepository.findByNombre("USER").orElseGet(() -> rolRepository.save(new Rol(null, "USER")));
        Rol rolAdmin = rolRepository.findByNombre("ADMIN").orElseGet(() -> rolRepository.save(new Rol(null, "ADMIN")));

        // Crear usuario admin si no existe
        Optional<Usuario> adminOpt = usuarioRepository.findByEmail("checho@gmail.com");
        if (adminOpt.isEmpty()) {
            Usuario admin = new Usuario();
            admin.setNombre("checho");
            admin.setEmail("checho@gmail.com");
            admin.setPassword(passwordEncoder.encode("12345"));
            admin.setDireccion("");
            admin.setTelefono("");
            admin.setRoles(Collections.singleton(rolAdmin));
            usuarioRepository.save(admin);
            System.out.println("Usuario admin inicial creado: checho@gmail.com / 12345");
        }
    }
} 