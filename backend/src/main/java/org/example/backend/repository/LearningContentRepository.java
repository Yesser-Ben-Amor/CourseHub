package org.example.backend.repository;

import org.example.backend.entity.LearningContentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningContentRepository extends JpaRepository<LearningContentEntity, Long> {
    List<LearningContentEntity> findByLearningPathIdOrderByOrderIndexAsc(Long learningPathId);
}