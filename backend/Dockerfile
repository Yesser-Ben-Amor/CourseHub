# Einfaches Java-Runtime-Image
FROM eclipse-temurin:17-jre

WORKDIR /app

# Erstelle einen Platzhalter für die JAR-Datei
RUN echo "Platzhalter für die JAR-Datei. Bitte bauen Sie die Anwendung lokal und kopieren Sie die JAR-Datei in den Container." > README.txt

# Kopiere die JAR-Datei, falls vorhanden (muss manuell hinzugefügt werden)
COPY target/*.jar app.jar 2>/dev/null || echo "Keine JAR-Datei gefunden. Bitte bauen Sie die Anwendung lokal."

# Fallback-JAR erstellen, falls keine vorhanden ist
RUN if [ ! -f app.jar ]; then \
    echo "package com.coursehub; public class DummyApp { public static void main(String[] args) { System.out.println(\"CourseHub API - Dummy-Anwendung\"); System.out.println(\"Bitte bauen Sie die echte Anwendung lokal und kopieren Sie die JAR-Datei in den Container.\"); } }" > DummyApp.java && \
    javac DummyApp.java && \
    jar cfe app.jar com.coursehub.DummyApp com/coursehub/DummyApp.class && \
    rm -f DummyApp.java com/coursehub/DummyApp.class; \
    fi

# Port freigeben
EXPOSE 8080

# Anwendung starten
ENTRYPOINT ["java", "-jar", "app.jar"]