package org.example.backend.repository;

import org.example.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    
    java.util.Optional<UserEntity> findByUsername(String username);
    java.util.Optional<UserEntity> findByEmail(String email);

    Optional<UserEntity> findByProviderAndProviderId(String provider, String providerId);
}
