package org.example.backend.repository;

import org.example.backend.entity.SeminarFileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeminarFileRepository extends JpaRepository<SeminarFileEntity, Long> {

    List<SeminarFileEntity> findBySeminarIdOrderByUploadTimeDesc(Long seminarId);

    List<SeminarFileEntity> findByFileType(String fileType);

    List<SeminarFileEntity> findBySeminarIdAndFileType(Long seminarId, String fileType);
}