package org.example.backend.controller;

import org.example.backend.entity.TeacherEntity;
import org.example.backend.repository.TeacherRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = "http://localhost:5173")
public class TeacherController {

    private final TeacherRepository teacherRepository;

    public TeacherController(TeacherRepository teacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllTeachers() {
        List<TeacherEntity> teachers = teacherRepository.findAll();

        List<Map<String, Object>> response = teachers.stream().map(teacher -> {
            Map<String, Object> teacherMap = new HashMap<>();
            teacherMap.put("id", teacher.getId());
            teacherMap.put("firstName", teacher.getFirstName());
            teacherMap.put("lastName", teacher.getLastName());
            teacherMap.put("birthDate", teacher.getBirthDate().toString());
            teacherMap.put("birthPlace", teacher.getBirthPlace());
            teacherMap.put("qualifications", teacher.getQualifications());
            teacherMap.put("subject", teacher.getSubject());
            teacherMap.put("createdAt", teacher.getCreatedAt().toString());
            return teacherMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createTeacher(@RequestBody Map<String, String> request) {
        TeacherEntity teacher = new TeacherEntity();
        teacher.setFirstName(request.get("firstName"));
        teacher.setLastName(request.get("lastName"));
        teacher.setBirthDate(LocalDate.parse(request.get("birthDate")));
        teacher.setBirthPlace(request.get("birthPlace"));
        teacher.setQualifications(request.get("qualifications"));
        teacher.setSubject(request.get("subject"));

        TeacherEntity saved = teacherRepository.save(teacher);

        Map<String, Object> response = new HashMap<>();
        response.put("id", saved.getId());
        response.put("firstName", saved.getFirstName());
        response.put("lastName", saved.getLastName());
        response.put("birthDate", saved.getBirthDate().toString());
        response.put("birthPlace", saved.getBirthPlace());
        response.put("qualifications", saved.getQualifications());
        response.put("subject", saved.getSubject());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateTeacher(
            @PathVariable Long id,
            @RequestBody Map<String, String> updates
    ) {
        return teacherRepository.findById(id)
                .map(teacher -> {
                    if (updates.containsKey("firstName")) {
                        teacher.setFirstName(updates.get("firstName"));
                    }
                    if (updates.containsKey("lastName")) {
                        teacher.setLastName(updates.get("lastName"));
                    }
                    if (updates.containsKey("birthDate")) {
                        teacher.setBirthDate(LocalDate.parse(updates.get("birthDate")));
                    }
                    if (updates.containsKey("birthPlace")) {
                        teacher.setBirthPlace(updates.get("birthPlace"));
                    }
                    if (updates.containsKey("qualifications")) {
                        teacher.setQualifications(updates.get("qualifications"));
                    }
                    if (updates.containsKey("subject")) {
                        teacher.setSubject(updates.get("subject"));
                    }

                    TeacherEntity updated = teacherRepository.save(teacher);

                    Map<String, Object> response = new HashMap<>();
                    response.put("id", updated.getId());
                    response.put("firstName", updated.getFirstName());
                    response.put("lastName", updated.getLastName());
                    response.put("birthDate", updated.getBirthDate().toString());
                    response.put("birthPlace", updated.getBirthPlace());
                    response.put("qualifications", updated.getQualifications());
                    response.put("subject", updated.getSubject());

                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeacher(@PathVariable Long id) {
        if (teacherRepository.existsById(id)) {
            teacherRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}