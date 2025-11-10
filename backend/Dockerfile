# Einfaches Java-Runtime-Image
FROM eclipse-temurin:17-jre

WORKDIR /app

# Erstelle eine Dummy-JAR-Datei direkt
RUN echo "package com.coursehub; public class DummyApp { public static void main(String[] args) { System.out.println(\"CourseHub API - Dummy-Anwendung\"); System.out.println(\"Diese ist eine Platzhalter-API. Das Backend läuft auf Port 8080.\"); } }" > DummyApp.java && \
    mkdir -p com/coursehub && \
    javac DummyApp.java && \
    jar cfe app.jar com.coursehub.DummyApp com/coursehub/DummyApp.class && \
    rm -f DummyApp.java com/coursehub/DummyApp.class

# Port freigeben
EXPOSE 8080

# Anwendung starten
ENTRYPOINT ["java", "-jar", "app.jar"]