package org.example.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "whiteboard_drawings")
public class WhiteboardEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seminar_id", nullable = false)
    private SeminarEntity seminar;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String drawingData; // JSON mit Canvas-Daten

    @Column(name = "drawn_by")
    private String drawnBy; // Dozent/Student Name

    @Column(name = "draw_time")
    private Instant drawTime;

    @Column(name = "action_type")
    private String actionType; // DRAW, ERASE, CLEAR

    @PrePersist
    protected void onCreate() {
        drawTime = Instant.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SeminarEntity getSeminar() { return seminar; }
    public void setSeminar(SeminarEntity seminar) { this.seminar = seminar; }

    public String getDrawingData() { return drawingData; }
    public void setDrawingData(String drawingData) { this.drawingData = drawingData; }

    public String getDrawnBy() { return drawnBy; }
    public void setDrawnBy(String drawnBy) { this.drawnBy = drawnBy; }

    public Instant getDrawTime() { return drawTime; }
    public void setDrawTime(Instant drawTime) { this.drawTime = drawTime; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
}