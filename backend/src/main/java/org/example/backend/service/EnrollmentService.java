package org.example.backend.service;

import org.example.backend.dto.EnrollmentRequest;
import org.example.backend.dto.EnrollmentResponse;
import org.example.backend.entity.CourseEntity;
import org.example.backend.entity.EnrollmentEntity;
import org.example.backend.entity.LearningPathEntity;
import org.example.backend.entity.UserEntity;
import org.example.backend.repository.CourseRepository;
import org.example.backend.repository.EnrollmentRepository;
import org.example.backend.repository.LearningPathRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LearningPathRepository learningPathRepository;

    public List<EnrollmentResponse> getAllEnrollments() {
        return enrollmentRepository.findAll().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public EnrollmentResponse enrollUser(EnrollmentRequest request) {
        // Prüfe ob bereits eingeschrieben
        if (enrollmentRepository.existsByUserIdAndCourseIdAndLearningPathId(
                request.getUserId(), request.getCourseId(), request.getLearningPathId())) {
            throw new RuntimeException("User ist bereits in diesem Lernpfad eingeschrieben");
        }

        // Lade Entities
        UserEntity user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User nicht gefunden"));

        CourseEntity course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Kurs nicht gefunden"));

        LearningPathEntity learningPath = learningPathRepository.findById(request.getLearningPathId())
                .orElseThrow(() -> new RuntimeException("Lernpfad nicht gefunden"));

        // Erstelle Enrollment
        EnrollmentEntity enrollment = new EnrollmentEntity(user, course, learningPath);
        enrollment = enrollmentRepository.save(enrollment);

        return mapToResponse(enrollment);
    }

    public List<EnrollmentResponse> getUserEnrollments(Long userId) {
        return enrollmentRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<EnrollmentResponse> getCourseEnrollments(Long courseId) {
        return enrollmentRepository.findByCourseId(courseId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void unenrollUser(Long enrollmentId) {
        enrollmentRepository.deleteById(enrollmentId);
    }

    public EnrollmentResponse updateProgress(Long enrollmentId, Integer progress) {
        EnrollmentEntity enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment nicht gefunden"));

        enrollment.setProgress(progress);

        if (progress >= 100) {
            enrollment.setCompleted(true);
        }

        enrollment = enrollmentRepository.save(enrollment);
        return mapToResponse(enrollment);
    }

    private EnrollmentResponse mapToResponse(EnrollmentEntity enrollment) {
        EnrollmentResponse response = new EnrollmentResponse();
        response.setId(enrollment.getId());
        response.setUserId(enrollment.getUser().getId());
        response.setUsername(enrollment.getUser().getUsername());
        response.setCourseId(enrollment.getCourse().getId());
        response.setCourseName(enrollment.getCourse().getName());
        response.setLearningPathId(enrollment.getLearningPath().getId());
        response.setLearningPathLevel(enrollment.getLearningPath().getLevel());
        response.setLearningPathPoints(enrollment.getLearningPath().getPoints());
        response.setEnrolledAt(enrollment.getEnrolledAt());
        response.setProgress(enrollment.getProgress());
        response.setCompleted(enrollment.getCompleted());
        response.setCompletedAt(enrollment.getCompletedAt());
        return response;
    }
}