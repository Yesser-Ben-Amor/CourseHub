package org.example.backend.configuration;

import org.example.backend.service.CourseService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class DataInitializer implements CommandLineRunner {

    private final CourseService courseService;

    public DataInitializer(CourseService courseService) {
        this.courseService = courseService;
    }

    @Override
    public void run(String... args) {
        // Prüfe ob DevOps bereits existiert
        if (courseService.getCourseByName("DevOps").isEmpty()) {
            // Erstelle DevOps Kurs
            var devOpsCourse = courseService.createCourse(
                    "DevOps",
                    "Lernen Sie DevOps-Praktiken und Tools für moderne Softwareentwicklung"
            );

            // Erstelle 3 Lernpfade
            courseService.createLearningPath(
                    devOpsCourse.getId(),
                    "Anfänger",
                    100,
                    12,
                    "Dieser Lernpfad führt Sie in die Grundlagen von DevOps ein. Sie lernen die wichtigsten Konzepte, Tools und Praktiken kennen."
            );

            courseService.createLearningPath(
                    devOpsCourse.getId(),
                    "Fortgeschrittene",
                    200,
                    12,
                    "Erweiterte DevOps-Techniken und Best Practices für erfahrene Entwickler."
            );

            courseService.createLearningPath(
                    devOpsCourse.getId(),
                    "Profis",
                    300,
                    12,
                    "Expertenwissen für DevOps-Profis mit Fokus auf komplexe Szenarien und Spezialisierungen."
            );

            System.out.println("✅ DevOps Kurs mit 3 Lernpfaden erstellt!");
        }
    }
}