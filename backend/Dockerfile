# Multi-Stage Build für Spring Boot-Backend

# Build-Stage
FROM maven:3.8-openjdk-17 AS build

# Arbeitsverzeichnis festlegen
WORKDIR /app

# Abhängigkeiten herunterladen
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Quellcode kopieren und bauen
COPY src ./src
RUN mvn package -DskipTests

# Production-Stage
FROM eclipse-temurin:17-jdk-alpine

# Arbeitsverzeichnis festlegen
WORKDIR /app

# JAR-Datei aus der Build-Stage kopieren
COPY --from=build /app/target/*.jar app.jar

# Port freigeben
EXPOSE 8080

# Umgebungsvariablen für die Datenbankverbindung
ENV SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/coursehub?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
ENV SPRING_DATASOURCE_USERNAME=coursehub
ENV SPRING_DATASOURCE_PASSWORD=password

# Anwendung starten
ENTRYPOINT ["java", "-jar", "app.jar"]