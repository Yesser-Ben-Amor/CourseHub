
package org.example.backend.dto;

public record RegisterRequest(
        @jakarta.validation.constraints.NotBlank String username,
        @jakarta.validation.constraints.Email String email,
        @jakarta.validation.constraints.Size(min = 8) String password
) {}
