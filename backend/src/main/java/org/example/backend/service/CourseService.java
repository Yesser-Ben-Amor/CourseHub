package org.example.backend.service;

import org.example.backend.entity.CourseEntity;
import org.example.backend.entity.LearningPathEntity;
import org.example.backend.entity.LearningContentEntity;
import org.example.backend.repository.CourseRepository;
import org.example.backend.repository.EnrollmentRepository;
import org.example.backend.repository.LearningPathRepository;
import org.example.backend.repository.LearningContentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final LearningPathRepository learningPathRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LearningContentRepository learningContentRepository;

    public CourseService(CourseRepository courseRepository, 
                         LearningPathRepository learningPathRepository,
                         @Autowired(required = false) EnrollmentRepository enrollmentRepository,
                         LearningContentRepository learningContentRepository) {
        this.courseRepository = courseRepository;
        this.learningPathRepository = learningPathRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.learningContentRepository = learningContentRepository;
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

    @Transactional
    public LearningPathEntity updateLearningPath(Long courseId, Long pathId, String level, 
                                                  Integer points, Integer durationWeeks, 
                                                  String overview, String description) {
        LearningPathEntity path = learningPathRepository.findById(pathId)
                .orElseThrow(() -> new RuntimeException("Learning path not found"));
        
        if (!path.getCourse().getId().equals(courseId)) {
            throw new RuntimeException("Learning path does not belong to this course");
        }
        
        path.setLevel(level);
        path.setPoints(points);
        path.setDurationWeeks(durationWeeks);
        path.setOverview(overview);
        path.setDescription(description);
        
        return learningPathRepository.save(path);
    }

    @Transactional
    public void deleteLearningPath(Long courseId, Long pathId) {
        LearningPathEntity path = learningPathRepository.findById(pathId)
                .orElseThrow(() -> new RuntimeException("Learning path not found"));
        
        if (!path.getCourse().getId().equals(courseId)) {
            throw new RuntimeException("Learning path does not belong to this course");
        }
        
        learningPathRepository.delete(path);
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

    // LearningContent CRUD
    public List<LearningContentEntity> getContentsByLearningPathId(Long learningPathId) {
        return learningContentRepository.findByLearningPathIdOrderByOrderIndexAsc(learningPathId);
    }

    @Transactional
    public LearningContentEntity createContent(Long learningPathId, String title, String type, 
                                               String description, String contentUrl, 
                                               Integer points, Integer orderIndex) {
        LearningPathEntity learningPath = learningPathRepository.findById(learningPathId)
                .orElseThrow(() -> new RuntimeException("Learning path not found"));
        
        LearningContentEntity content = new LearningContentEntity();
        content.setLearningPath(learningPath);
        content.setTitle(title);
        content.setType(type);
        content.setDescription(description);
        content.setContentUrl(contentUrl);
        content.setPoints(points);
        content.setOrderIndex(orderIndex);
        
        return learningContentRepository.save(content);
    }

    @Transactional
    public LearningContentEntity updateContent(Long contentId, String title, String type,
                                               String description, String contentUrl,
                                               Integer points, Integer orderIndex) {
        LearningContentEntity content = learningContentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        
        content.setTitle(title);
        content.setType(type);
        content.setDescription(description);
        content.setContentUrl(contentUrl);
        content.setPoints(points);
        content.setOrderIndex(orderIndex);
        
        return learningContentRepository.save(content);
    }

    @Transactional
    public void deleteContent(Long contentId) {
        learningContentRepository.deleteById(contentId);
    }
}