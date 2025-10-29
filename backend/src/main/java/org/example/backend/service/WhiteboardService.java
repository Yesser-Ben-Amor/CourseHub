package org.example.backend.service;

import org.example.backend.entity.SeminarEntity;
import org.example.backend.entity.WhiteboardEntity;
import org.example.backend.repository.SeminarRepository;
import org.example.backend.repository.WhiteboardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WhiteboardService {

    private final WhiteboardRepository whiteboardRepository;
    private final SeminarRepository seminarRepository;

    public WhiteboardService(WhiteboardRepository whiteboardRepository,
                             SeminarRepository seminarRepository) {
        this.whiteboardRepository = whiteboardRepository;
        this.seminarRepository = seminarRepository;
    }

    @Transactional
    public WhiteboardEntity saveDrawing(Long seminarId, String drawingData, String drawnBy, String actionType) {
        SeminarEntity seminar = seminarRepository.findById(seminarId)
                .orElseThrow(() -> new RuntimeException("Seminar not found"));

        WhiteboardEntity drawing = new WhiteboardEntity();
        drawing.setSeminar(seminar);
        drawing.setDrawingData(drawingData);
        drawing.setDrawnBy(drawnBy);
        drawing.setActionType(actionType);

        return whiteboardRepository.save(drawing);
    }

    public List<WhiteboardEntity> getDrawingsBySeminar(Long seminarId) {
        return whiteboardRepository.findBySeminarIdOrderByDrawTimeAsc(seminarId);
    }

    @Transactional
    public void clearWhiteboard(Long seminarId, String clearedBy) {
        // Lösche alle Zeichnungen
        whiteboardRepository.deleteBySeminarId(seminarId);

        // Speichere Clear-Action
        saveDrawing(seminarId, "{\"action\":\"clear\"}", clearedBy, "CLEAR");
    }

    @Transactional
    public void deleteDrawing(Long drawingId) {
        whiteboardRepository.deleteById(drawingId);
    }
}