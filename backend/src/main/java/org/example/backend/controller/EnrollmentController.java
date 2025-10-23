package org.example.backend.controller;

import org.example.backend.dto.EnrollmentRequest;
import org.example.backend.dto.EnrollmentResponse;
import org.example.backend.dto.UserStatsResponse;
import org.example.backend.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "http://localhost:5173")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @GetMapping
    public ResponseEntity<List<EnrollmentResponse>> getAllEnrollments() {
        List<EnrollmentResponse> enrollments = enrollmentService.getAllEnrollments();
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<UserStatsResponse> getUserStats(@PathVariable Long userId) {
        UserStatsResponse stats = enrollmentService.getUserStats(userId);
        return ResponseEntity.ok(stats);
    }

    @PostMapping
    public ResponseEntity<EnrollmentResponse> enrollUser(@RequestBody EnrollmentRequest request) {
        try {
            EnrollmentResponse response = enrollmentService.enrollUser(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<EnrollmentResponse>> getUserEnrollments(@PathVariable Long userId) {
        List<EnrollmentResponse> enrollments = enrollmentService.getUserEnrollments(userId);
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<EnrollmentResponse>> getCourseEnrollments(@PathVariable Long courseId) {
        List<EnrollmentResponse> enrollments = enrollmentService.getCourseEnrollments(courseId);
        return ResponseEntity.ok(enrollments);
    }

    @DeleteMapping("/{enrollmentId}")
    public ResponseEntity<Map<String, String>> unenrollUser(@PathVariable Long enrollmentId) {
        try {
            enrollmentService.unenrollUser(enrollmentId);
            return ResponseEntity.ok(Map.of("message", "Erfolgreich abgemeldet"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Fehler beim Abmelden"));
        }
    }

    @PutMapping("/{enrollmentId}/progress")
    public ResponseEntity<EnrollmentResponse> updateProgress(
            @PathVariable Long enrollmentId,
            @RequestBody Map<String, Integer> body) {
        try {
            Integer progress = body.get("progress");
            EnrollmentResponse response = enrollmentService.updateProgress(enrollmentId, progress);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}