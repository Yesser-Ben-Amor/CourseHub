package org.example.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "learning_paths")
public class LearningPathEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private CourseEntity course;

    @Column(nullable = false, length = 50)
    private String level; // Anfänger, Fortgeschrittene, Profis

    @Column(nullable = false)
    private Integer points; // 100, 200, 300

    @Column(nullable = false)
    private Integer durationWeeks;

    @Column(length = 1000)
    private String overview;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CourseEntity getCourse() { return course; }
    public void setCourse(CourseEntity course) { this.course = course; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }

    public Integer getDurationWeeks() { return durationWeeks; }
    public void setDurationWeeks(Integer durationWeeks) { this.durationWeeks = durationWeeks; }

    public String getOverview() { return overview; }
    public void setOverview(String overview) { this.overview = overview; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}