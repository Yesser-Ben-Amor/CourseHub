package org.example.backend.controller;

import org.example.backend.entity.SeminarFileEntity;
import org.example.backend.service.FileUploadService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/seminars/{seminarId}/files")
@CrossOrigin(origins = "http://localhost:5173")
public class FileUploadController {

    private final FileUploadService fileUploadService;

    public FileUploadController(FileUploadService fileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @PathVariable Long seminarId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("uploadedBy") String uploadedBy,
            @RequestParam(value = "description", required = false) String description) {
        try {
            SeminarFileEntity fileEntity = fileUploadService.uploadFile(seminarId, file, uploadedBy, description);

            Map<String, Object> response = new HashMap<>();
            response.put("id", fileEntity.getId());
            response.put("fileName", fileEntity.getOriginalFileName());
            response.put("fileType", fileEntity.getFileType());
            response.put("fileSize", fileEntity.getFileSize());
            response.put("uploadedBy", fileEntity.getUploadedBy());
            response.put("uploadTime", fileEntity.getUploadTime().toString());

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "File upload failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getFiles(@PathVariable Long seminarId) {
        List<SeminarFileEntity> files = fileUploadService.getFilesBySeminar(seminarId);

        List<Map<String, Object>> response = files.stream().map(file -> {
            Map<String, Object> fileMap = new HashMap<>();
            fileMap.put("id", file.getId());
            fileMap.put("fileName", file.getOriginalFileName());
            fileMap.put("fileType", file.getFileType());
            fileMap.put("fileSize", file.getFileSize());
            fileMap.put("uploadedBy", file.getUploadedBy());
            fileMap.put("uploadTime", file.getUploadTime().toString());
            fileMap.put("description", file.getDescription());
            return fileMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long seminarId, @PathVariable Long fileId) {
        try {
            // Hole die Datei aus der Datenbank
            SeminarFileEntity fileEntity = fileUploadService.getFileById(fileId);
            
            // Überprüfe, ob die Datei zum angegebenen Seminar gehört
            if (fileEntity.getSeminar() == null || !seminarId.equals(fileEntity.getSeminar().getId())) {
                return ResponseEntity.badRequest().build();
            }
            
            // Erstelle einen Pfad zur physischen Datei
            Path filePath = Paths.get(fileEntity.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            
            // Überprüfe, ob die Datei existiert und lesbar ist
            if (resource.exists() && resource.isReadable()) {
                // Bestimme den MIME-Typ der Datei
                String contentType = determineContentType(fileEntity.getFileType(), fileEntity.getOriginalFileName());
                
                // Bereite die Antwort vor
                MediaType mediaType;
                try {
                    mediaType = MediaType.parseMediaType(contentType);
                } catch (Exception e) {
                    // Fallback auf application/octet-stream bei ungültigem MIME-Typ
                    mediaType = MediaType.APPLICATION_OCTET_STREAM;
                }
                
                return ResponseEntity.ok()
                        .contentType(mediaType)
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                               "attachment; filename=\"" + fileEntity.getOriginalFileName() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Bestimmt den MIME-Typ basierend auf dem Dateityp und dem Dateinamen
     */
    private String determineContentType(String fileType, String fileName) {
        if (fileType.equals("IMAGE")) {
            if (fileName.toLowerCase().endsWith(".png")) return "image/png";
            if (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg")) return "image/jpeg";
            if (fileName.toLowerCase().endsWith(".gif")) return "image/gif";
            return "image/png"; // Fallback
        } else if (fileType.equals("PDF")) {
            return "application/pdf";
        } else if (fileType.equals("VIDEO")) {
            if (fileName.toLowerCase().endsWith(".mp4")) return "video/mp4";
            if (fileName.toLowerCase().endsWith(".webm")) return "video/webm";
            return "video/mp4"; // Fallback
        } else {
            // Für alle anderen Dateitypen
            return "application/octet-stream";
        }
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<Map<String, String>> deleteFile(@PathVariable Long seminarId, @PathVariable Long fileId) {
        try {
            fileUploadService.deleteFile(fileId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "File deleted successfully");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "File deletion failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}