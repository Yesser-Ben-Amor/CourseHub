package org.example.backend.controller;

import org.example.backend.entity.BookEntity;
import org.example.backend.service.BookService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "http://localhost:5173")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> addBook(
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "courseId", required = false) Long courseId,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            BookEntity bookEntity = bookService.addBook(title, author, description, courseId, file);

            Map<String, Object> response = new HashMap<>();
            response.put("id", bookEntity.getId());
            response.put("title", bookEntity.getTitle());
            response.put("author", bookEntity.getAuthor());
            response.put("description", bookEntity.getDescription());
            response.put("courseId", bookEntity.getCourseId());
            response.put("icon", bookEntity.getIcon());

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Book creation failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllBooks() {
        List<BookEntity> books = bookService.getAllBooks();

        List<Map<String, Object>> response = books.stream().map(book -> {
            Map<String, Object> bookMap = new HashMap<>();
            bookMap.put("id", book.getId());
            bookMap.put("title", book.getTitle());
            bookMap.put("author", book.getAuthor());
            bookMap.put("description", book.getDescription());
            bookMap.put("courseId", book.getCourseId());
            bookMap.put("icon", book.getIcon());
            return bookMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getBookById(@PathVariable Long id) {
        try {
            BookEntity book = bookService.getBookById(id);

            Map<String, Object> response = new HashMap<>();
            response.put("id", book.getId());
            response.put("title", book.getTitle());
            response.put("author", book.getAuthor());
            response.put("description", book.getDescription());
            response.put("courseId", book.getCourseId());
            response.put("icon", book.getIcon());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateBook(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "author", required = false) String author,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "courseId", required = false) Long courseId,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            BookEntity bookEntity = bookService.updateBook(id, title, author, description, courseId, file);

            Map<String, Object> response = new HashMap<>();
            response.put("id", bookEntity.getId());
            response.put("title", bookEntity.getTitle());
            response.put("author", bookEntity.getAuthor());
            response.put("description", bookEntity.getDescription());
            response.put("courseId", bookEntity.getCourseId());
            response.put("icon", bookEntity.getIcon());

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Book update failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBook(@PathVariable Long id) {
        try {
            bookService.deleteBook(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Book deleted successfully");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Book deletion failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadBookFile(@PathVariable Long id) {
        try {
            Resource resource = bookService.getBookFileAsResource(id);
            BookEntity book = bookService.getBookById(id);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + book.getTitle().replaceAll("\\s+", "_") + ".pdf\"")
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}