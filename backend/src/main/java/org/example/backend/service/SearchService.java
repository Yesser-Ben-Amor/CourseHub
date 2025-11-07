package org.example.backend.service;

import org.example.backend.dto.SearchResultDTO;
import org.example.backend.entity.BookEntity;
import org.example.backend.entity.CourseEntity;
import org.example.backend.entity.TeacherEntity;
import org.example.backend.entity.UserEntity;
import org.example.backend.repository.BookRepository;
import org.example.backend.repository.CourseRepository;
import org.example.backend.repository.TeacherRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final BookRepository bookRepository;
    private final CourseRepository courseRepository;

    @Autowired
    public SearchService(UserRepository userRepository,
                         TeacherRepository teacherRepository,
                         BookRepository bookRepository,
                         CourseRepository courseRepository) {
        this.userRepository = userRepository;
        this.teacherRepository = teacherRepository;
        this.bookRepository = bookRepository;
        this.courseRepository = courseRepository;
    }

    public List<SearchResultDTO> searchByName(String query) {
        List<SearchResultDTO> results = new ArrayList<>();
        String queryLower = query.toLowerCase();

        // Studenten nach Namen suchen
        List<UserEntity> users = userRepository.findAll().stream()
                .filter(user -> user.getUsername().toLowerCase().contains(queryLower))
                .collect(Collectors.toList());

        results.addAll(users.stream()
                .map(user -> new SearchResultDTO("student", mapUserToResponse(user)))
                .collect(Collectors.toList()));

        // Dozenten nach Namen suchen
        List<TeacherEntity> teachers = teacherRepository.findAll().stream()
                .filter(teacher ->
                        teacher.getFirstName().toLowerCase().contains(queryLower) ||
                                teacher.getLastName().toLowerCase().contains(queryLower))
                .collect(Collectors.toList());

        results.addAll(teachers.stream()
                .map(teacher -> new SearchResultDTO("teacher", mapTeacherToResponse(teacher)))
                .collect(Collectors.toList()));

        return results;
    }

    public List<SearchResultDTO> searchById(String query) {
        List<SearchResultDTO> results = new ArrayList<>();
        String queryLower = query.toLowerCase();

        // Studenten nach ID suchen
        List<UserEntity> users = userRepository.findAll().stream()
                .filter(user -> String.valueOf(user.getId()).contains(queryLower))
                .collect(Collectors.toList());

        results.addAll(users.stream()
                .map(user -> new SearchResultDTO("student", mapUserToResponse(user)))
                .collect(Collectors.toList()));

        // Dozenten nach ID suchen
        List<TeacherEntity> teachers = teacherRepository.findAll().stream()
                .filter(teacher -> String.valueOf(teacher.getId()).contains(queryLower))
                .collect(Collectors.toList());

        results.addAll(teachers.stream()
                .map(teacher -> new SearchResultDTO("teacher", mapTeacherToResponse(teacher)))
                .collect(Collectors.toList()));

        // Bücher nach ID suchen
        List<BookEntity> books = bookRepository.findAll().stream()
                .filter(book -> String.valueOf(book.getId()).contains(queryLower))
                .collect(Collectors.toList());

        results.addAll(books.stream()
                .map(book -> new SearchResultDTO("book", mapBookToResponse(book)))
                .collect(Collectors.toList()));

        // Kurse nach ID suchen
        List<CourseEntity> courses = courseRepository.findAll().stream()
                .filter(course -> String.valueOf(course.getId()).contains(queryLower))
                .collect(Collectors.toList());

        results.addAll(courses.stream()
                .map(course -> new SearchResultDTO("course", mapCourseToResponse(course)))
                .collect(Collectors.toList()));

        return results;
    }

    public List<SearchResultDTO> searchByEmail(String query) {
        String queryLower = query.toLowerCase();

        List<UserEntity> users = userRepository.findAll().stream()
                .filter(user -> user.getEmail().toLowerCase().contains(queryLower))
                .collect(Collectors.toList());

        return users.stream()
                .map(user -> new SearchResultDTO("student", mapUserToResponse(user)))
                .collect(Collectors.toList());
    }

    public List<SearchResultDTO> searchByDate(String query) {
        List<SearchResultDTO> results = new ArrayList<>();
        String queryLower = query.toLowerCase();

        // Studenten nach Erstellungsdatum suchen
        List<UserEntity> users = userRepository.findAll().stream()
                .filter(user -> user.getCreatedAt() != null &&
                        user.getCreatedAt().toString().toLowerCase().contains(queryLower))
                .collect(Collectors.toList());

        results.addAll(users.stream()
                .map(user -> new SearchResultDTO("student", mapUserToResponse(user)))
                .collect(Collectors.toList()));

        // Dozenten nach Geburtsdatum suchen
        List<TeacherEntity> teachers = teacherRepository.findAll().stream()
                .filter(teacher -> teacher.getBirthDate() != null &&
                        teacher.getBirthDate().toString().toLowerCase().contains(queryLower))
                .collect(Collectors.toList());

        results.addAll(teachers.stream()
                .map(teacher -> new SearchResultDTO("teacher", mapTeacherToResponse(teacher)))
                .collect(Collectors.toList()));

        return results;
    }

    public List<SearchResultDTO> searchBySubject(String query) {
        String queryLower = query.toLowerCase();

        List<TeacherEntity> teachers = teacherRepository.findAll().stream()
                .filter(teacher -> teacher.getSubject() != null &&
                        teacher.getSubject().toLowerCase().contains(queryLower))
                .collect(Collectors.toList());

        return teachers.stream()
                .map(teacher -> new SearchResultDTO("teacher", mapTeacherToResponse(teacher)))
                .collect(Collectors.toList());
    }

    public List<SearchResultDTO> searchByTitle(String query) {
        List<SearchResultDTO> results = new ArrayList<>();
        String queryLower = query.toLowerCase();

        // Bücher nach Titel suchen
        List<BookEntity> books = bookRepository.findAll().stream()
                .filter(book -> book.getTitle() != null &&
                        book.getTitle().toLowerCase().contains(queryLower))
                .collect(Collectors.toList());

        results.addAll(books.stream()
                .map(book -> new SearchResultDTO("book", mapBookToResponse(book)))
                .collect(Collectors.toList()));

        // Kurse nach Titel suchen
        List<CourseEntity> courses = courseRepository.findAll().stream()
                .filter(course -> course.getName() != null &&
                        course.getName().toLowerCase().contains(queryLower))
                .collect(Collectors.toList());

        results.addAll(courses.stream()
                .map(course -> new SearchResultDTO("course", mapCourseToResponse(course)))
                .collect(Collectors.toList()));

        return results;
    }

    public List<SearchResultDTO> searchByAuthor(String query) {
        String queryLower = query.toLowerCase();

        List<BookEntity> books = bookRepository.findAll().stream()
                .filter(book -> book.getAuthor() != null &&
                        book.getAuthor().toLowerCase().contains(queryLower))
                .collect(Collectors.toList());

        return books.stream()
                .map(book -> new SearchResultDTO("book", mapBookToResponse(book)))
                .collect(Collectors.toList());
    }

    public List<SearchResultDTO> searchAllFields(String query) {
        List<SearchResultDTO> results = new ArrayList<>();
        String queryLower = query.toLowerCase();

        // Studenten in allen Feldern suchen
        List<UserEntity> users = userRepository.findAll().stream()
                .filter(user ->
                        (user.getUsername() != null && user.getUsername().toLowerCase().contains(queryLower)) ||
                                (user.getEmail() != null && user.getEmail().toLowerCase().contains(queryLower)) ||
                                String.valueOf(user.getId()).contains(queryLower) ||
                                (user.getCreatedAt() != null && user.getCreatedAt().toString().toLowerCase().contains(queryLower)))
                .collect(Collectors.toList());

        results.addAll(users.stream()
                .map(user -> new SearchResultDTO("student", mapUserToResponse(user)))
                .collect(Collectors.toList()));

        // Dozenten in allen Feldern suchen
        List<TeacherEntity> teachers = teacherRepository.findAll().stream()
                .filter(teacher ->
                        (teacher.getFirstName() != null && teacher.getFirstName().toLowerCase().contains(queryLower)) ||
                                (teacher.getLastName() != null && teacher.getLastName().toLowerCase().contains(queryLower)) ||
                                String.valueOf(teacher.getId()).contains(queryLower) ||
                                (teacher.getBirthDate() != null && teacher.getBirthDate().toString().toLowerCase().contains(queryLower)) ||
                                (teacher.getSubject() != null && teacher.getSubject().toLowerCase().contains(queryLower)))
                .collect(Collectors.toList());

        results.addAll(teachers.stream()
                .map(teacher -> new SearchResultDTO("teacher", mapTeacherToResponse(teacher)))
                .collect(Collectors.toList()));

        // Bücher in allen Feldern suchen
        List<BookEntity> books = bookRepository.findAll().stream()
                .filter(book ->
                        (book.getTitle() != null && book.getTitle().toLowerCase().contains(queryLower)) ||
                                (book.getAuthor() != null && book.getAuthor().toLowerCase().contains(queryLower)) ||
                                (book.getDescription() != null && book.getDescription().toLowerCase().contains(queryLower)) ||
                                String.valueOf(book.getId()).contains(queryLower))
                .collect(Collectors.toList());

        results.addAll(books.stream()
                .map(book -> new SearchResultDTO("book", mapBookToResponse(book)))
                .collect(Collectors.toList()));

        // Kurse in allen Feldern suchen
        List<CourseEntity> courses = courseRepository.findAll().stream()
                .filter(course ->
                        (course.getName() != null && course.getName().toLowerCase().contains(queryLower)) ||
                                (course.getDescription() != null && course.getDescription().toLowerCase().contains(queryLower)) ||
                                String.valueOf(course.getId()).contains(queryLower))
                .collect(Collectors.toList());

        results.addAll(courses.stream()
                .map(course -> new SearchResultDTO("course", mapCourseToResponse(course)))
                .collect(Collectors.toList()));

        return results;
    }

    // Hilfsmethoden zum Mapping der Entitäten auf Response-Objekte

    private Map<String, Object> mapUserToResponse(UserEntity user) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("username", user.getUsername());
        userMap.put("email", user.getEmail());
        if (user.getCreatedAt() != null) {
            userMap.put("createdAt", user.getCreatedAt().toString());
        }
        return userMap;
    }

    private Map<String, Object> mapTeacherToResponse(TeacherEntity teacher) {
        Map<String, Object> teacherMap = new HashMap<>();
        teacherMap.put("id", teacher.getId());
        teacherMap.put("firstName", teacher.getFirstName());
        teacherMap.put("lastName", teacher.getLastName());
        if (teacher.getBirthDate() != null) {
            teacherMap.put("birthDate", teacher.getBirthDate().toString());
        }
        teacherMap.put("subject", teacher.getSubject());
        return teacherMap;
    }

    private Map<String, Object> mapBookToResponse(BookEntity book) {
        Map<String, Object> bookMap = new HashMap<>();
        bookMap.put("id", book.getId());
        bookMap.put("title", book.getTitle());
        bookMap.put("author", book.getAuthor());
        bookMap.put("description", book.getDescription());
        bookMap.put("courseId", book.getCourseId());
        return bookMap;
    }

    private Map<String, Object> mapCourseToResponse(CourseEntity course) {
        Map<String, Object> courseMap = new HashMap<>();
        courseMap.put("id", course.getId());
        courseMap.put("name", course.getName());
        courseMap.put("description", course.getDescription());
        return courseMap;
    }
}