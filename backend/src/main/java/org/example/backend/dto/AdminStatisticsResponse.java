package org.example.backend.dto;

public class AdminStatisticsResponse {
    private long totalStudents;
    private long totalTeachers;
    private long totalEnrollments;
    private long totalCertificates;
    private long totalCourses;

    public AdminStatisticsResponse() {}

    public AdminStatisticsResponse(long totalStudents, long totalTeachers, long totalEnrollments,
                                   long totalCertificates, long totalCourses) {
        this.totalStudents = totalStudents;
        this.totalTeachers = totalTeachers;
        this.totalEnrollments = totalEnrollments;
        this.totalCertificates = totalCertificates;
        this.totalCourses = totalCourses;
    }

    // Getters and Setters
    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getTotalTeachers() { return totalTeachers; }
    public void setTotalTeachers(long totalTeachers) { this.totalTeachers = totalTeachers; }

    public long getTotalEnrollments() { return totalEnrollments; }
    public void setTotalEnrollments(long totalEnrollments) { this.totalEnrollments = totalEnrollments; }

    public long getTotalCertificates() { return totalCertificates; }
    public void setTotalCertificates(long totalCertificates) { this.totalCertificates = totalCertificates; }

    public long getTotalCourses() { return totalCourses; }
    public void setTotalCourses(long totalCourses) { this.totalCourses = totalCourses; }
}