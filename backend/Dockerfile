# Einfaches Maven-Image für Spring Boot-Entwicklung
FROM maven:3.8.7-eclipse-temurin-17

# Arbeitsverzeichnis festlegen
WORKDIR /app

# Kopiere pom.xml und den Quellcode
COPY pom.xml .
COPY src ./src

# Port freigeben
EXPOSE 8080

# Umgebungsvariablen für die Datenbankverbindung
ENV SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/coursehub?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
ENV SPRING_DATASOURCE_USERNAME=coursehub
ENV SPRING_DATASOURCE_PASSWORD=password
ENV SPRING_PROFILES_ACTIVE=dev

# Maven-Cache-Verzeichnis erstellen
RUN mkdir -p /root/.m2

# Anwendung im Entwicklungsmodus starten
CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.profiles=dev"]