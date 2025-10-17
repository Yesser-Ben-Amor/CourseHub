package org.example.backend.controller;

import org.example.backend.entity.UserEntity;
import org.example.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<UserEntity> users = userRepository.findAll();

        List<Map<String, Object>> response = users.stream().map(user -> {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("username", user.getUsername());
            userMap.put("email", user.getEmail());
            userMap.put("createdAt", user.getCreatedAt().toString());
            userMap.put("provider", user.getProvider());
            return userMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("username", user.getUsername());
                    userMap.put("email", user.getEmail());
                    userMap.put("createdAt", user.getCreatedAt().toString());
                    userMap.put("provider", user.getProvider());
                    return ResponseEntity.ok(userMap);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, String> updates
    ) {
        return userRepository.findById(id)
                .map(user -> {
                    if (updates.containsKey("username")) {
                        user.setUsername(updates.get("username"));
                    }
                    if (updates.containsKey("email")) {
                        user.setEmail(updates.get("email"));
                    }

                    UserEntity updated = userRepository.save(user);

                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", updated.getId());
                    userMap.put("username", updated.getUsername());
                    userMap.put("email", updated.getEmail());
                    userMap.put("createdAt", updated.getCreatedAt().toString());

                    return ResponseEntity.ok(userMap);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}