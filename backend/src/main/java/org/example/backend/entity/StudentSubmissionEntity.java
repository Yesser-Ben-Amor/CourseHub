package org.example.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "student_submissions")
public class StudentSubmissionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seminar_id", nullable = false)
    private SeminarEntity seminar;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionType submissionType;

    @Column(name = "content_url") // Für Links oder File-Pfade
    private String contentUrl;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "submission_time")
    private Instant submissionTime;

    @Column(name = "instructor_feedback", columnDefinition = "TEXT")
    private String instructorFeedback;

    @Column(name = "grade")
    private Integer grade; // 0-100

    @PrePersist
    protected void onCreate() {
        submissionTime = Instant.now();
    }

    public enum SubmissionType {
        LINK,       // YouTube, GitHub, etc.
        IMAGE,      // Hochgeladenes Bild
        VIDEO,      // Hochgeladenes Video
        DOCUMENT    // PDF, Word, etc.
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SeminarEntity getSeminar() { return seminar; }
    public void setSeminar(SeminarEntity seminar) { this.seminar = seminar; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public SubmissionType getSubmissionType() { return submissionType; }
    public void setSubmissionType(SubmissionType submissionType) { this.submissionType = submissionType; }

    public String getContentUrl() { return contentUrl; }
    public void setContentUrl(String contentUrl) { this.contentUrl = contentUrl; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public Instant getSubmissionTime() { return submissionTime; }
    public void setSubmissionTime(Instant submissionTime) { this.submissionTime = submissionTime; }

    public String getInstructorFeedback() { return instructorFeedback; }
    public void setInstructorFeedback(String instructorFeedback) { this.instructorFeedback = instructorFeedback; }

    public Integer getGrade() { return grade; }
    public void setGrade(Integer grade) { this.grade = grade; }
}