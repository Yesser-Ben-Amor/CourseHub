# Multi-Stage Build für Spring Boot-Backend

# Build-Stage
FROM maven:3.8.7-eclipse-temurin-17 AS build

# Arbeitsverzeichnis festlegen
WORKDIR /app

# Kopiere pom.xml und lade Abhängigkeiten herunter
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Kopiere den Quellcode
COPY src ./src

# Baue die Anwendung ohne Tests
RUN mvn package -DskipTests

# Runtime-Stage
FROM eclipse-temurin:17-jre-alpine

# Arbeitsverzeichnis festlegen
WORKDIR /app

# Kopiere die JAR-Datei aus der Build-Stage
COPY --from=build /app/target/*.jar app.jar

# Port freigeben
EXPOSE 8080

# Umgebungsvariablen für die Datenbankverbindung
ENV SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/coursehub?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
ENV SPRING_DATASOURCE_USERNAME=coursehub
ENV SPRING_DATASOURCE_PASSWORD=password

# Anwendung starten
CMD ["java", "-jar", "app.jar"]