package org.example.backend.service;

import org.example.backend.entity.CourseEntity;
import org.example.backend.entity.LearningPathEntity;
import org.example.backend.repository.CourseRepository;
import org.example.backend.repository.LearningPathRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final LearningPathRepository learningPathRepository;

    public CourseService(CourseRepository courseRepository, LearningPathRepository learningPathRepository) {
        this.courseRepository = courseRepository;
        this.learningPathRepository = learningPathRepository;
    }

    public List<CourseEntity> getAllCourses() {
        return courseRepository.findAll();
    }

    public Optional<CourseEntity> getCourseById(Long id) {
        return courseRepository.findById(id);
    }

    public Optional<CourseEntity> getCourseByName(String name) {
        return courseRepository.findByName(name);
    }

    @Transactional
    public CourseEntity createCourse(String name, String description) {
        CourseEntity course = new CourseEntity();
        course.setName(name);
        course.setDescription(description);
        return courseRepository.save(course);
    }

    public List<LearningPathEntity> getLearningPathsByCourseId(Long courseId) {
        return learningPathRepository.findByCourseId(courseId);
    }

    public Optional<LearningPathEntity> getLearningPathById(Long id) {
        return learningPathRepository.findById(id);
    }

    @Transactional
    public LearningPathEntity createLearningPath(Long courseId, String level, Integer points, Integer durationWeeks, String overview) {
        CourseEntity course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        LearningPathEntity learningPath = new LearningPathEntity();
        learningPath.setCourse(course);
        learningPath.setLevel(level);
        learningPath.setPoints(points);
        learningPath.setDurationWeeks(durationWeeks);
        learningPath.setOverview(overview);

        return learningPathRepository.save(learningPath);
    }
}