package org.example.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Email oder Username ist erforderlich")
        String usernameOrEmail,

        @NotBlank(message = "Passwort ist erforderlich")
        String password
) {
}