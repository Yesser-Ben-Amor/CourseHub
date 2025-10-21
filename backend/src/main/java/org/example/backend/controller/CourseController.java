package org.example.backend.controller;

import org.example.backend.entity.CourseEntity;
import org.example.backend.entity.LearningPathEntity;
import org.example.backend.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:5173")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllCourses() {
        List<CourseEntity> courses = courseService.getAllCourses();

        List<Map<String, Object>> response = courses.stream().map(course -> {
            Map<String, Object> courseMap = new HashMap<>();
            courseMap.put("id", course.getId());
            courseMap.put("name", course.getName());
            courseMap.put("description", course.getDescription());

            List<Map<String, Object>> paths = course.getLearningPaths().stream().map(path -> {
                Map<String, Object> pathMap = new HashMap<>();
                pathMap.put("id", path.getId());
                pathMap.put("level", path.getLevel());
                pathMap.put("points", path.getPoints());
                pathMap.put("durationWeeks", path.getDurationWeeks());
                pathMap.put("overview", path.getOverview());
                return pathMap;
            }).collect(Collectors.toList());

            courseMap.put("learningPaths", paths);
            return courseMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCourseById(@PathVariable Long id) {
        return courseService.getCourseById(id)
                .map(course -> {
                    Map<String, Object> courseMap = new HashMap<>();
                    courseMap.put("id", course.getId());
                    courseMap.put("name", course.getName());
                    courseMap.put("description", course.getDescription());

                    List<Map<String, Object>> paths = course.getLearningPaths().stream().map(path -> {
                        Map<String, Object> pathMap = new HashMap<>();
                        pathMap.put("id", path.getId());
                        pathMap.put("level", path.getLevel());
                        pathMap.put("points", path.getPoints());
                        pathMap.put("durationWeeks", path.getDurationWeeks());
                        pathMap.put("overview", path.getOverview());
                        return pathMap;
                    }).collect(Collectors.toList());

                    courseMap.put("learningPaths", paths);
                    return ResponseEntity.ok(courseMap);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<Map<String, Object>> getCourseByName(@PathVariable String name) {
        return courseService.getCourseByName(name)
                .map(course -> {
                    Map<String, Object> courseMap = new HashMap<>();
                    courseMap.put("id", course.getId());
                    courseMap.put("name", course.getName());
                    courseMap.put("description", course.getDescription());

                    List<Map<String, Object>> paths = course.getLearningPaths().stream().map(path -> {
                        Map<String, Object> pathMap = new HashMap<>();
                        pathMap.put("id", path.getId());
                        pathMap.put("level", path.getLevel());
                        pathMap.put("points", path.getPoints());
                        pathMap.put("durationWeeks", path.getDurationWeeks());
                        pathMap.put("overview", path.getOverview());
                        return pathMap;
                    }).collect(Collectors.toList());

                    courseMap.put("learningPaths", paths);
                    return ResponseEntity.ok(courseMap);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{courseId}/paths")
    public ResponseEntity<List<Map<String, Object>>> getLearningPaths(@PathVariable Long courseId) {
        List<LearningPathEntity> paths = courseService.getLearningPathsByCourseId(courseId);

        List<Map<String, Object>> response = paths.stream().map(path -> {
            Map<String, Object> pathMap = new HashMap<>();
            pathMap.put("id", path.getId());
            pathMap.put("level", path.getLevel());
            pathMap.put("points", path.getPoints());
            pathMap.put("durationWeeks", path.getDurationWeeks());
            pathMap.put("overview", path.getOverview());
            return pathMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createCourse(@RequestBody CourseEntity course) {
        try {
            CourseEntity created = courseService.createCourse(course.getName(), course.getDescription());
            Map<String, Object> courseMap = new HashMap<>();
            courseMap.put("id", created.getId());
            courseMap.put("name", created.getName());
            courseMap.put("description", created.getDescription());
            return ResponseEntity.ok(courseMap);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Kurs erfolgreich gelöscht");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Fehler beim Löschen des Kurses: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateCourse(@PathVariable Long id, @RequestBody CourseEntity courseUpdate) {
        try {
            CourseEntity updated = courseService.updateCourse(id, courseUpdate);
            Map<String, Object> courseMap = new HashMap<>();
            courseMap.put("id", updated.getId());
            courseMap.put("name", updated.getName());
            courseMap.put("description", updated.getDescription());
            return ResponseEntity.ok(courseMap);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}