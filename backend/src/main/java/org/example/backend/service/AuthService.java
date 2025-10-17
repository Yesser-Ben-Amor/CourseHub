package org.example.backend.service;

import org.example.backend.dto.LoginRequest;
import org.example.backend.dto.LoginResponse;
import org.example.backend.dto.RegisterRequest;
import org.example.backend.dto.UserResponse;
import org.example.backend.entity.UserEntity;
import org.example.backend.repository.UserRepository;
import org.example.backend.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        // Validierung: Email bereits vorhanden?
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email bereits registriert");
        }

        // Validierung: Username bereits vorhanden?
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Benutzername bereits vergeben");
        }

        // User Entity erstellen
        UserEntity user = new UserEntity();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setProvider("local"); // Normale Registrierung

        // Speichern
        UserEntity savedUser = userRepository.save(user);

        // Response zurückgeben (ohne Passwort!)
        return new UserResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail()
        );
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        // User suchen (entweder per Username oder Email)
        UserEntity user = userRepository.findByUsername(request.usernameOrEmail())
                .or(() -> userRepository.findByEmail(request.usernameOrEmail()))
                .orElseThrow(() -> new IllegalArgumentException("Ungültige Anmeldedaten"));

        // Passwort prüfen
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Ungültige Anmeldedaten");
        }

        // JWT Token generieren
        String token = jwtUtil.generateToken(user.getUsername());

        // Response zurückgeben
        return new LoginResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
    }
}