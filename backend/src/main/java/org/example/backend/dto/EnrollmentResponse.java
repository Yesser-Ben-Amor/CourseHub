package org.example.backend.dto;

import java.time.LocalDateTime;

public class EnrollmentResponse {
    private Long id;
    private Long userId;
    private String username;
    private Long courseId;
    private String courseName;
    private Long learningPathId;
    private String learningPathLevel;
    private Integer learningPathPoints;
    private LocalDateTime enrolledAt;
    private Integer progress;
    private Boolean completed;
    private LocalDateTime completedAt;

    // Constructors
    public EnrollmentResponse() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public Long getLearningPathId() { return learningPathId; }
    public void setLearningPathId(Long learningPathId) { this.learningPathId = learningPathId; }

    public String getLearningPathLevel() { return learningPathLevel; }
    public void setLearningPathLevel(String learningPathLevel) { this.learningPathLevel = learningPathLevel; }

    public Integer getLearningPathPoints() { return learningPathPoints; }
    public void setLearningPathPoints(Integer learningPathPoints) { this.learningPathPoints = learningPathPoints; }

    public LocalDateTime getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(LocalDateTime enrolledAt) { this.enrolledAt = enrolledAt; }

    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }

    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}