package org.example.backend.repository;

import org.example.backend.entity.StudentSubmissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentSubmissionRepository extends JpaRepository<StudentSubmissionEntity, Long> {

    List<StudentSubmissionEntity> findBySeminarIdOrderBySubmissionTimeDesc(Long seminarId);

    List<StudentSubmissionEntity> findByStudentIdAndSeminarId(Long studentId, Long seminarId);

    List<StudentSubmissionEntity> findBySeminarIdAndSubmissionType(Long seminarId, StudentSubmissionEntity.SubmissionType submissionType);

    long countBySeminarId(Long seminarId);
}