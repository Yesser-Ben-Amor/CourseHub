package org.example.backend.controller;

import org.example.backend.entity.CourseEntity;
import org.example.backend.entity.LearningPathEntity;
import org.example.backend.entity.LearningContentEntity;
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

    @PostMapping("/{courseId}/paths")
    public ResponseEntity<Map<String, Object>> createLearningPath(
            @PathVariable Long courseId,
            @RequestBody Map<String, Object> request) {
        try {
            String level = (String) request.get("level");
            Integer points = (Integer) request.get("points");
            Integer durationWeeks = (Integer) request.get("durationWeeks");
            String overview = (String) request.get("overview");

            LearningPathEntity path = courseService.createLearningPath(courseId, level, points, durationWeeks, overview);

            Map<String, Object> response = new HashMap<>();
            response.put("id", path.getId());
            response.put("level", path.getLevel());
            response.put("points", path.getPoints());
            response.put("durationWeeks", path.getDurationWeeks());
            response.put("overview", path.getOverview());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{courseId}/paths/{pathId}")
    public ResponseEntity<Map<String, Object>> updateLearningPath(
            @PathVariable Long courseId,
            @PathVariable Long pathId,
            @RequestBody Map<String, Object> request) {
        try {
            String level = (String) request.get("level");
            String description = (String) request.get("description");
            Integer points = (Integer) request.get("points");
            Integer durationWeeks = (Integer) request.get("durationWeeks");
            String overview = (String) request.get("overview");

            LearningPathEntity path = courseService.updateLearningPath(courseId, pathId, level, points, durationWeeks, overview, description);

            Map<String, Object> response = new HashMap<>();
            response.put("id", path.getId());
            response.put("level", path.getLevel());
            response.put("description", path.getDescription());
            response.put("points", path.getPoints());
            response.put("durationWeeks", path.getDurationWeeks());
            response.put("overview", path.getOverview());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{courseId}/paths/{pathId}")
    public ResponseEntity<Map<String, String>> deleteLearningPath(
            @PathVariable Long courseId,
            @PathVariable Long pathId) {
        try {
            courseService.deleteLearningPath(courseId, pathId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Learning path deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
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

    @GetMapping("/{id}/enrollment-count")
    public ResponseEntity<Map<String, Long>> getEnrollmentCount(@PathVariable Long id) {
        long count = courseService.getEnrollmentCount(id);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
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

    // LearningContent Endpoints
    @GetMapping("/{courseId}/paths/{pathId}/contents")
    public ResponseEntity<List<Map<String, Object>>> getContents(
            @PathVariable Long courseId,
            @PathVariable Long pathId) {
        List<LearningContentEntity> contents = courseService.getContentsByLearningPathId(pathId);
        
        List<Map<String, Object>> response = contents.stream().map(content -> {
            Map<String, Object> contentMap = new HashMap<>();
            contentMap.put("id", content.getId());
            contentMap.put("title", content.getTitle());
            contentMap.put("type", content.getType());
            contentMap.put("description", content.getDescription());
            contentMap.put("contentUrl", content.getContentUrl());
            contentMap.put("points", content.getPoints());
            contentMap.put("orderIndex", content.getOrderIndex());
            return contentMap;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{courseId}/paths/{pathId}/contents")
    public ResponseEntity<Map<String, Object>> createContent(
            @PathVariable Long courseId,
            @PathVariable Long pathId,
            @RequestBody Map<String, Object> request) {
        try {
            String title = (String) request.get("title");
            String type = (String) request.get("type");
            String description = (String) request.get("description");
            String contentUrl = (String) request.get("contentUrl");
            Integer points = (Integer) request.get("points");
            Integer orderIndex = (Integer) request.get("orderIndex");
            
            LearningContentEntity content = courseService.createContent(
                pathId, title, type, description, contentUrl, points, orderIndex
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", content.getId());
            response.put("title", content.getTitle());
            response.put("type", content.getType());
            response.put("description", content.getDescription());
            response.put("contentUrl", content.getContentUrl());
            response.put("points", content.getPoints());
            response.put("orderIndex", content.getOrderIndex());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{courseId}/paths/{pathId}/contents/{contentId}")
    public ResponseEntity<Map<String, Object>> updateContent(
            @PathVariable Long courseId,
            @PathVariable Long pathId,
            @PathVariable Long contentId,
            @RequestBody Map<String, Object> request) {
        try {
            String title = (String) request.get("title");
            String type = (String) request.get("type");
            String description = (String) request.get("description");
            String contentUrl = (String) request.get("contentUrl");
            Integer points = (Integer) request.get("points");
            Integer orderIndex = (Integer) request.get("orderIndex");
            
            LearningContentEntity content = courseService.updateContent(
                contentId, title, type, description, contentUrl, points, orderIndex
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", content.getId());
            response.put("title", content.getTitle());
            response.put("type", content.getType());
            response.put("description", content.getDescription());
            response.put("contentUrl", content.getContentUrl());
            response.put("points", content.getPoints());
            response.put("orderIndex", content.getOrderIndex());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{courseId}/paths/{pathId}/contents/{contentId}")
    public ResponseEntity<Map<String, String>> deleteContent(
            @PathVariable Long courseId,
            @PathVariable Long pathId,
            @PathVariable Long contentId) {
        try {
            courseService.deleteContent(contentId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Content deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}