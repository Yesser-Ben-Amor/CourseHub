package org.example.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "learning_contents")
public class LearningContentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 50)
    private String type; // VIDEO, TEXT, PDF, QUIZ

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "content_url", columnDefinition = "TEXT")
    private String contentUrl; // YouTube URL, PDF URL, etc.

    @Column(nullable = false)
    private Integer points;

    @Column(name = "order_index")
    private Integer orderIndex;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_path_id", nullable = false)
    private LearningPathEntity learningPath;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getContentUrl() { return contentUrl; }
    public void setContentUrl(String contentUrl) { this.contentUrl = contentUrl; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }

    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }

    public LearningPathEntity getLearningPath() { return learningPath; }
    public void setLearningPath(LearningPathEntity learningPath) { this.learningPath = learningPath; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}