package org.example.backend.repository;

import org.example.backend.entity.CourseEntity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class CourseRepositoryTest {

    @Autowired
    private CourseRepository courseRepository;

    @Test
    void saveAndFindByName() {
        CourseEntity course = new CourseEntity();
        course.setName("DevOps");
        course.setDescription("Testbeschreibung");
        courseRepository.save(course);

        Optional<CourseEntity> found = courseRepository.findByName("DevOps");
        assertThat(found).isPresent();
        assertThat(found.get().getDescription()).isEqualTo("Testbeschreibung");
        assertThat(found.get().getId()).isNotNull();
        assertThat(found.get().getCreatedAt()).isNotNull();
    }
}