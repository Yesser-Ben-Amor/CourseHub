package org.example.backend.repository;

import org.example.backend.entity.WhiteboardEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WhiteboardRepository extends JpaRepository<WhiteboardEntity, Long> {

    List<WhiteboardEntity> findBySeminarIdOrderByDrawTimeAsc(Long seminarId);

    List<WhiteboardEntity> findBySeminarIdAndActionType(Long seminarId, String actionType);

    void deleteBySeminarId(Long seminarId);
}