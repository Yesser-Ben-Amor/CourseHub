# Verwende Maven mit OpenJDK 17 (verfügbare Version)
FROM maven:3.8.7-eclipse-temurin-17

# Arbeitsverzeichnis festlegen
WORKDIR /app

# Kopiere pom.xml und lade Abhängigkeiten herunter
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Kopiere den Quellcode
COPY src ./src

# Port freigeben
EXPOSE 8080

# Umgebungsvariablen für die Datenbankverbindung
ENV SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/coursehub?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
ENV SPRING_DATASOURCE_USERNAME=coursehub
ENV SPRING_DATASOURCE_PASSWORD=password
ENV SPRING_PROFILES_ACTIVE=dev

# Anwendung im Entwicklungsmodus starten
CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.profiles=dev"]