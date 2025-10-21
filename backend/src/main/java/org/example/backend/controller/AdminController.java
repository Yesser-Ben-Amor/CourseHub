package org.example.backend.controller;

import org.example.backend.dto.AdminStatisticsResponse;
import org.example.backend.repository.CourseRepository;
import org.example.backend.repository.EnrollmentRepository;
import org.example.backend.repository.TeacherRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public AdminController(UserRepository userRepository,
                           TeacherRepository teacherRepository,
                           CourseRepository courseRepository,
                           EnrollmentRepository enrollmentRepository) {
        this.userRepository = userRepository;
        this.teacherRepository = teacherRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @GetMapping("/statistics")
    public ResponseEntity<AdminStatisticsResponse> getStatistics() {
        long totalStudents = userRepository.count();
        long totalTeachers = teacherRepository.count();
        long totalCourses = courseRepository.count();
        long totalEnrollments = enrollmentRepository.count();

        // TODO: Implementiere Certificates wenn Entity existiert
        long totalCertificates = 0;

        AdminStatisticsResponse stats = new AdminStatisticsResponse(
                totalStudents,
                totalTeachers,
                totalEnrollments,
                totalCertificates,
                totalCourses
        );

        return ResponseEntity.ok(stats);
    }
}