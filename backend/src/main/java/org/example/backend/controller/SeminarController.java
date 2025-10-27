package org.example.backend.controller;

import org.example.backend.entity.SeminarEntity;
import org.example.backend.service.SeminarService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/seminars")
@CrossOrigin(origins = "http://localhost:5173")
public class SeminarController {

    private final SeminarService seminarService;

    public SeminarController(SeminarService seminarService) {
        this.seminarService = seminarService;
    }

    // Alle Seminare abrufen
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllSeminars() {
        List<SeminarEntity> seminars = seminarService.getAllSeminars();
        List<Map<String, Object>> response = seminars.stream().map(this::mapSeminarToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // Kommende Seminare
    @GetMapping("/upcoming")
    public ResponseEntity<List<Map<String, Object>>> getUpcomingSeminars() {
        List<SeminarEntity> seminars = seminarService.getUpcomingSeminars();
        List<Map<String, Object>> response = seminars.stream().map(this::mapSeminarToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // Live Seminare
    @GetMapping("/live")
    public ResponseEntity<List<Map<String, Object>>> getLiveSeminars() {
        List<SeminarEntity> seminars = seminarService.getLiveSeminars();
        List<Map<String, Object>> response = seminars.stream().map(this::mapSeminarToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // Heutige Seminare
    @GetMapping("/today")
    public ResponseEntity<List<Map<String, Object>>> getTodaysSeminars() {
        List<SeminarEntity> seminars = seminarService.getTodaysSeminars();
        List<Map<String, Object>> response = seminars.stream().map(this::mapSeminarToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // Seminar nach ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getSeminarById(@PathVariable Long id) {
        return seminarService.getSeminarById(id)
                .map(seminar -> ResponseEntity.ok(mapSeminarToResponse(seminar)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Neues Seminar erstellen
    @PostMapping
    public ResponseEntity<Map<String, Object>> createSeminar(@RequestBody Map<String, Object> request) {
        try {
            String title = (String) request.get("title");
            String description = (String) request.get("description");
            String instructorName = (String) request.get("instructorName");
            LocalDateTime startTime = LocalDateTime.parse((String) request.get("startTime"));
            LocalDateTime endTime = LocalDateTime.parse((String) request.get("endTime"));
            Integer maxParticipants = (Integer) request.get("maxParticipants");
            String meetingUrl = (String) request.get("meetingUrl");
            String meetingId = (String) request.get("meetingId");
            String meetingPassword = (String) request.get("meetingPassword");

            SeminarEntity seminar = seminarService.createSeminar(title, description, instructorName,
                    startTime, endTime, maxParticipants, meetingUrl, meetingId, meetingPassword);

            return ResponseEntity.ok(mapSeminarToResponse(seminar));
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Seminar aktualisieren
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateSeminar(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            String title = (String) request.get("title");
            String description = (String) request.get("description");
            String instructorName = (String) request.get("instructorName");
            LocalDateTime startTime = LocalDateTime.parse((String) request.get("startTime"));
            LocalDateTime endTime = LocalDateTime.parse((String) request.get("endTime"));
            Integer maxParticipants = (Integer) request.get("maxParticipants");
            String meetingUrl = (String) request.get("meetingUrl");
            String meetingId = (String) request.get("meetingId");
            String meetingPassword = (String) request.get("meetingPassword");

            SeminarEntity seminar = seminarService.updateSeminar(id, title, description, instructorName,
                    startTime, endTime, maxParticipants, meetingUrl, meetingId, meetingPassword);

            return ResponseEntity.ok(mapSeminarToResponse(seminar));
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Seminar Status ändern
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateSeminarStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String statusStr = request.get("status");
            SeminarEntity.SeminarStatus status = SeminarEntity.SeminarStatus.valueOf(statusStr);

            SeminarEntity seminar = seminarService.updateSeminarStatus(id, status);
            return ResponseEntity.ok(mapSeminarToResponse(seminar));
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Am Seminar teilnehmen
    @PostMapping("/{id}/join")
    public ResponseEntity<Map<String, Object>> joinSeminar(@PathVariable Long id) {
        try {
            SeminarEntity seminar = seminarService.joinSeminar(id);
            return ResponseEntity.ok(mapSeminarToResponse(seminar));
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Seminar löschen
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteSeminar(@PathVariable Long id) {
        try {
            seminarService.deleteSeminar(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Seminar deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Helper Methode für Response Mapping
    private Map<String, Object> mapSeminarToResponse(SeminarEntity seminar) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", seminar.getId());
        response.put("title", seminar.getTitle());
        response.put("description", seminar.getDescription());
        response.put("instructorName", seminar.getInstructorName());
        response.put("startTime", seminar.getStartTime().toString());
        response.put("endTime", seminar.getEndTime().toString());
        response.put("maxParticipants", seminar.getMaxParticipants());
        response.put("currentParticipants", seminar.getCurrentParticipants());
        response.put("meetingUrl", seminar.getMeetingUrl());
        response.put("meetingId", seminar.getMeetingId());
        response.put("meetingPassword", seminar.getMeetingPassword());
        response.put("status", seminar.getStatus().toString());
        response.put("createdAt", seminar.getCreatedAt().toString());
        return response;
    }
}