package org.example.backend.repository;

import org.example.backend.entity.LearningPathEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningPathRepository extends JpaRepository<LearningPathEntity, Long> {
    List<LearningPathEntity> findByCourseId(Long courseId);
    Optional<LearningPathEntity> findByCourseIdAndLevel(Long courseId, String level);
}
