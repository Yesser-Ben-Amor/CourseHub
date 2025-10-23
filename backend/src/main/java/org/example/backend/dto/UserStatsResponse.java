package org.example.backend.dto;

import java.time.Instant;

public class UserStatsResponse {
    private long totalEnrollments;
    private double averageProgress;
    private long completedCourses;
    private Instant lastActivity;

    public UserStatsResponse(long totalEnrollments, double averageProgress, long completedCourses, Instant lastActivity) {
        this.totalEnrollments = totalEnrollments;
        this.averageProgress = averageProgress;
        this.completedCourses = completedCourses;
        this.lastActivity = lastActivity;
    }

    // Getters and Setters
    public long getTotalEnrollments() {
        return totalEnrollments;
    }

    public void setTotalEnrollments(long totalEnrollments) {
        this.totalEnrollments = totalEnrollments;
    }

    public double getAverageProgress() {
        return averageProgress;
    }

    public void setAverageProgress(double averageProgress) {
        this.averageProgress = averageProgress;
    }

    public long getCompletedCourses() {
        return completedCourses;
    }

    public void setCompletedCourses(long completedCourses) {
        this.completedCourses = completedCourses;
    }

    public Instant getLastActivity() {
        return lastActivity;
    }

    public void setLastActivity(Instant lastActivity) {
        this.lastActivity = lastActivity;
    }
}