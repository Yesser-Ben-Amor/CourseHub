package org.example.backend.repository;

import org.example.backend.entity.BookEntity;
import org.example.backend.entity.CourseEntity;
import org.example.backend.entity.TeacherEntity;
import org.example.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchRepository {

    // Suche nach Namen (Studenten und Dozenten)
    @Query("SELECT u FROM UserEntity u WHERE " +
            "LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<UserEntity> searchUsersByName(@Param("query") String query);

    @Query("SELECT t FROM TeacherEntity t WHERE " +
            "LOWER(t.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(t.lastName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<TeacherEntity> searchTeachersByName(@Param("query") String query);

    // Suche nach ID
    @Query("SELECT u FROM UserEntity u WHERE CAST(u.id AS string) LIKE CONCAT('%', :query, '%')")
    List<UserEntity> searchUsersById(@Param("query") String query);

    @Query("SELECT t FROM TeacherEntity t WHERE CAST(t.id AS string) LIKE CONCAT('%', :query, '%')")
    List<TeacherEntity> searchTeachersById(@Param("query") String query);

    @Query("SELECT b FROM BookEntity b WHERE CAST(b.id AS string) LIKE CONCAT('%', :query, '%')")
    List<BookEntity> searchBooksById(@Param("query") String query);

    @Query("SELECT c FROM CourseEntity c WHERE CAST(c.id AS string) LIKE CONCAT('%', :query, '%')")
    List<CourseEntity> searchCoursesById(@Param("query") String query);

    // Suche nach E-Mail (nur Studenten)
    @Query("SELECT u FROM UserEntity u WHERE " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<UserEntity> searchUsersByEmail(@Param("query") String query);

    // Suche nach Datum
    @Query("SELECT u FROM UserEntity u WHERE " +
            "LOWER(CAST(u.createdAt AS string)) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<UserEntity> searchUsersByDate(@Param("query") String query);

    @Query("SELECT t FROM TeacherEntity t WHERE " +
            "LOWER(CAST(t.birthDate AS string)) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<TeacherEntity> searchTeachersByDate(@Param("query") String query);

    // Suche nach Fach (nur Dozenten)
    @Query("SELECT t FROM TeacherEntity t WHERE " +
            "LOWER(t.subject) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<TeacherEntity> searchTeachersBySubject(@Param("query") String query);

    // Suche nach Titel (Bücher und Kurse)
    @Query("SELECT b FROM BookEntity b WHERE " +
            "LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<BookEntity> searchBooksByTitle(@Param("query") String query);

    @Query("SELECT c FROM CourseEntity c WHERE " +
            "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<CourseEntity> searchCoursesByTitle(@Param("query") String query);

    // Suche nach Autor (nur Bücher)
    @Query("SELECT b FROM BookEntity b WHERE " +
            "LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<BookEntity> searchBooksByAuthor(@Param("query") String query);

    // Volltextsuche über alle Felder
    @Query("SELECT u FROM UserEntity u WHERE " +
            "LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "CAST(u.id AS string) LIKE CONCAT('%', :query, '%') OR " +
            "LOWER(CAST(u.createdAt AS string)) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<UserEntity> searchUsersAllFields(@Param("query") String query);

    @Query("SELECT t FROM TeacherEntity t WHERE " +
            "LOWER(t.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(t.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "CAST(t.id AS string) LIKE CONCAT('%', :query, '%') OR " +
            "LOWER(CAST(t.birthDate AS string)) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(t.subject) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<TeacherEntity> searchTeachersAllFields(@Param("query") String query);

    @Query("SELECT b FROM BookEntity b WHERE " +
            "LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(b.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "CAST(b.id AS string) LIKE CONCAT('%', :query, '%')")
    List<BookEntity> searchBooksAllFields(@Param("query") String query);

    @Query("SELECT c FROM CourseEntity c WHERE " +
            "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "CAST(c.id AS string) LIKE CONCAT('%', :query, '%')")
    List<CourseEntity> searchCoursesAllFields(@Param("query") String query);
}