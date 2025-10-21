package org.example.backend.dto;

public class EnrollmentRequest {
    private Long userId;
    private Long courseId;
    private Long learningPathId;

    // Constructors
    public EnrollmentRequest() {}

    public EnrollmentRequest(Long userId, Long courseId, Long learningPathId) {
        this.userId = userId;
        this.courseId = courseId;
        this.learningPathId = learningPathId;
    }

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public Long getLearningPathId() { return learningPathId; }
    public void setLearningPathId(Long learningPathId) { this.learningPathId = learningPathId; }
}