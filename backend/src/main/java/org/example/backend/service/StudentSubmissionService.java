package org.example.backend.service;

import org.example.backend.entity.SeminarEntity;
import org.example.backend.entity.StudentSubmissionEntity;
import org.example.backend.repository.SeminarRepository;
import org.example.backend.repository.StudentSubmissionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class StudentSubmissionService {

    private final StudentSubmissionRepository submissionRepository;
    private final SeminarRepository seminarRepository;

    @Value("${file.upload.dir:uploads/submissions}")
    private String uploadDir;

    public StudentSubmissionService(StudentSubmissionRepository submissionRepository,
                                    SeminarRepository seminarRepository) {
        this.submissionRepository = submissionRepository;
        this.seminarRepository = seminarRepository;
    }

    // Link-Submission (YouTube, GitHub, etc.)
    @Transactional
    public StudentSubmissionEntity submitLink(Long seminarId, Long studentId, String studentName,
                                              String title, String description, String url) {
        SeminarEntity seminar = seminarRepository.findById(seminarId)
                .orElseThrow(() -> new RuntimeException("Seminar not found"));

        StudentSubmissionEntity submission = new StudentSubmissionEntity();
        submission.setSeminar(seminar);
        submission.setStudentId(studentId);
        submission.setStudentName(studentName);
        submission.setTitle(title);
        submission.setDescription(description);
        submission.setSubmissionType(StudentSubmissionEntity.SubmissionType.LINK);
        submission.setContentUrl(url);

        return submissionRepository.save(submission);
    }

    // File-Submission (Bild, Video, Dokument)
    @Transactional
    public StudentSubmissionEntity submitFile(Long seminarId, Long studentId, String studentName,
                                              String title, String description, MultipartFile file) throws IOException {
        SeminarEntity seminar = seminarRepository.findById(seminarId)
                .orElseThrow(() -> new RuntimeException("Seminar not found"));

        // Erstelle Upload-Verzeichnis
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Speichere Datei
        String originalFileName = file.getOriginalFilename();
        String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        String fileName = UUID.randomUUID().toString() + fileExtension;
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        // Bestimme Submission-Typ
        StudentSubmissionEntity.SubmissionType submissionType = determineSubmissionType(file.getContentType());

        StudentSubmissionEntity submission = new StudentSubmissionEntity();
        submission.setSeminar(seminar);
        submission.setStudentId(studentId);
        submission.setStudentName(studentName);
        submission.setTitle(title);
        submission.setDescription(description);
        submission.setSubmissionType(submissionType);
        submission.setContentUrl(filePath.toString());
        submission.setFileName(originalFileName);
        submission.setFileSize(file.getSize());

        return submissionRepository.save(submission);
    }

    public List<StudentSubmissionEntity> getSubmissionsBySeminar(Long seminarId) {
        return submissionRepository.findBySeminarIdOrderBySubmissionTimeDesc(seminarId);
    }

    public List<StudentSubmissionEntity> getSubmissionsByStudent(Long studentId, Long seminarId) {
        return submissionRepository.findByStudentIdAndSeminarId(studentId, seminarId);
    }

    @Transactional
    public StudentSubmissionEntity gradSubmission(Long submissionId, String feedback, Integer grade) {
        StudentSubmissionEntity submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        submission.setInstructorFeedback(feedback);
        submission.setGrade(grade);

        return submissionRepository.save(submission);
    }

    @Transactional
    public void deleteSubmission(Long submissionId) throws IOException {
        StudentSubmissionEntity submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        // Lösche Datei falls vorhanden
        if (submission.getSubmissionType() != StudentSubmissionEntity.SubmissionType.LINK) {
            Path filePath = Paths.get(submission.getContentUrl());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        }

        submissionRepository.delete(submission);
    }

    public long getSubmissionCount(Long seminarId) {
        return submissionRepository.countBySeminarId(seminarId);
    }

    private StudentSubmissionEntity.SubmissionType determineSubmissionType(String contentType) {
        if (contentType == null) return StudentSubmissionEntity.SubmissionType.DOCUMENT;

        if (contentType.startsWith("image/")) return StudentSubmissionEntity.SubmissionType.IMAGE;
        if (contentType.startsWith("video/")) return StudentSubmissionEntity.SubmissionType.VIDEO;

        return StudentSubmissionEntity.SubmissionType.DOCUMENT;
    }
}