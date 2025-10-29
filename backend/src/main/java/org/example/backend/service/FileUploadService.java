package org.example.backend.service;

import org.example.backend.entity.SeminarEntity;
import org.example.backend.entity.SeminarFileEntity;
import org.example.backend.repository.SeminarFileRepository;
import org.example.backend.repository.SeminarRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class FileUploadService {

    private final SeminarFileRepository seminarFileRepository;
    private final SeminarRepository seminarRepository;

    @Value("${file.upload.dir:uploads/seminars}")
    private String uploadDir;

    public FileUploadService(SeminarFileRepository seminarFileRepository,
                             SeminarRepository seminarRepository) {
        this.seminarFileRepository = seminarFileRepository;
        this.seminarRepository = seminarRepository;
    }

    @Transactional
    public SeminarFileEntity uploadFile(Long seminarId, MultipartFile file, String uploadedBy, String description) throws IOException {
        SeminarEntity seminar = seminarRepository.findById(seminarId)
                .orElseThrow(() -> new RuntimeException("Seminar not found"));

        // Erstelle Upload-Verzeichnis falls nicht vorhanden
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generiere eindeutigen Dateinamen
        String originalFileName = file.getOriginalFilename();
        String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        String fileName = UUID.randomUUID().toString() + fileExtension;

        // Speichere Datei
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        // Bestimme Dateityp
        String fileType = determineFileType(file.getContentType());

        // Erstelle Entity
        SeminarFileEntity fileEntity = new SeminarFileEntity();
        fileEntity.setSeminar(seminar);
        fileEntity.setFileName(fileName);
        fileEntity.setOriginalFileName(originalFileName);
        fileEntity.setFilePath(filePath.toString());
        fileEntity.setFileType(fileType);
        fileEntity.setFileSize(file.getSize());
        fileEntity.setUploadedBy(uploadedBy);
        fileEntity.setDescription(description);

        return seminarFileRepository.save(fileEntity);
    }

    public List<SeminarFileEntity> getFilesBySeminar(Long seminarId) {
        return seminarFileRepository.findBySeminarIdOrderByUploadTimeDesc(seminarId);
    }
    
    /**
     * Holt eine Datei anhand ihrer ID
     * @param fileId Die ID der Datei
     * @return Die gefundene Datei
     * @throws RuntimeException wenn die Datei nicht gefunden wird
     */
    public SeminarFileEntity getFileById(Long fileId) {
        return seminarFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found with id: " + fileId));
    }

    @Transactional
    public void deleteFile(Long fileId) throws IOException {
        SeminarFileEntity fileEntity = seminarFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        // Lösche physische Datei
        Path filePath = Paths.get(fileEntity.getFilePath());
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }

        // Lösche DB-Eintrag
        seminarFileRepository.delete(fileEntity);
    }

    private String determineFileType(String contentType) {
        if (contentType == null) return "DOCUMENT";

        if (contentType.startsWith("image/")) return "IMAGE";
        if (contentType.startsWith("video/")) return "VIDEO";
        if (contentType.equals("application/pdf")) return "PDF";

        return "DOCUMENT";
    }
}