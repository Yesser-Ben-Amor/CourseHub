package org.example.backend.repository;

import org.example.backend.entity.EnrollmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<EnrollmentEntity, Long> {

    List<EnrollmentEntity> findByUserId(Long userId);

    List<EnrollmentEntity> findByCourseId(Long courseId);

    Optional<EnrollmentEntity> findByUserIdAndCourseIdAndLearningPathId(
            Long userId, Long courseId, Long learningPathId
    );

    boolean existsByUserIdAndCourseIdAndLearningPathId(
            Long userId, Long courseId, Long learningPathId
    );

    long countByUserId(Long userId);

    long countByCourseId(Long courseId);
}