package org.example.backend.service;

import org.example.backend.entity.BookEntity;
import org.example.backend.repository.BookRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final Path fileStorageLocation;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
        this.fileStorageLocation = Paths.get("uploads/books").toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create the directory where the uploaded books will be stored.", ex);
        }
    }

    public List<BookEntity> getAllBooks() {
        return bookRepository.findAll();
    }

    public BookEntity getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id " + id));
    }

    public BookEntity addBook(String title, String author, String description, Long courseId, MultipartFile file) throws IOException {
        BookEntity book = new BookEntity();
        book.setTitle(title);
        book.setAuthor(author);
        book.setDescription(description);
        book.setCourseId(courseId);

        // Zufälliges Icon zuweisen
        String[] icons = {"📕", "📗", "📘", "📙"};
        book.setIcon(icons[(int) (Math.random() * icons.length)]);

        if (file != null && !file.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            book.setFilePath(targetLocation.toString());
            book.setOriginalFileName(file.getOriginalFilename());
            book.setFileType(file.getContentType());
            book.setFileSize(file.getSize());
        }

        return bookRepository.save(book);
    }

    public BookEntity updateBook(Long id, String title, String author, String description, Long courseId, MultipartFile file) throws IOException {
        BookEntity book = getBookById(id);

        if (title != null) book.setTitle(title);
        if (author != null) book.setAuthor(author);
        if (description != null) book.setDescription(description);
        if (courseId != null) book.setCourseId(courseId);

        if (file != null && !file.isEmpty()) {
            // Alte Datei löschen, falls vorhanden
            if (book.getFilePath() != null) {
                Path oldFile = Paths.get(book.getFilePath());
                Files.deleteIfExists(oldFile);
            }

            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            book.setFilePath(targetLocation.toString());
            book.setOriginalFileName(file.getOriginalFilename());
            book.setFileType(file.getContentType());
            book.setFileSize(file.getSize());
        }

        return bookRepository.save(book);
    }

    public void deleteBook(Long id) throws IOException {
        BookEntity book = getBookById(id);

        if (book.getFilePath() != null) {
            Path file = Paths.get(book.getFilePath());
            Files.deleteIfExists(file);
        }

        bookRepository.delete(book);
    }

    public Resource getBookFileAsResource(Long id) throws Exception {
        BookEntity book = getBookById(id);

        if (book.getFilePath() == null) {
            throw new RuntimeException("Book file not found");
        }

        Path filePath = Paths.get(book.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists()) {
            return resource;
        } else {
            throw new RuntimeException("Book file not found");
        }
    }
}