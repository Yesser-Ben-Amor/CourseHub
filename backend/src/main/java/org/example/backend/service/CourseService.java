package org.example.backend.service;

import org.example.backend.entity.CourseEntity;
import org.example.backend.entity.LearningPathEntity;
import org.example.backend.repository.CourseRepository;
import org.example.backend.repository.EnrollmentRepository;
import org.example.backend.repository.LearningPathRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final LearningPathRepository learningPathRepository;
    
    @Autowired(required = false)
    private EnrollmentRepository enrollmentRepository;

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

    public long getEnrollmentCount(Long courseId) {
        if (enrollmentRepository != null) {
            return enrollmentRepository.countByCourseId(courseId);
        }
        return 0;
    }

    @Transactional
    public void deleteCourse(Long id) {
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        // Lösche zuerst alle Enrollments für diesen Kurs (CASCADE)
        if (enrollmentRepository != null) {
            List<org.example.backend.entity.EnrollmentEntity> enrollments = enrollmentRepository.findByCourseId(id);
            if (!enrollments.isEmpty()) {
                enrollmentRepository.deleteAll(enrollments);
            }
        }
        
        // Dann lösche den Kurs (LearningPaths werden automatisch gelöscht wegen CascadeType.ALL)
        courseRepository.delete(course);
    }

    @Transactional
    public CourseEntity updateCourse(Long id, CourseEntity courseUpdate) {
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        if (courseUpdate.getName() != null) {
            course.setName(courseUpdate.getName());
        }
        if (courseUpdate.getDescription() != null) {
            course.setDescription(courseUpdate.getDescription());
        }
        
        return courseRepository.save(course);
    }
}