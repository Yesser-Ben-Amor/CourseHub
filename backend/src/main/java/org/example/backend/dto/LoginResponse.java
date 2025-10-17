package org.example.backend.dto;

public record LoginResponse(
        String token,
        String type,
        Long id,
        String username,
        String email
) {
    public LoginResponse(String token, Long id, String username, String email) {
        this(token, "Bearer", id, username, email);
    }
}