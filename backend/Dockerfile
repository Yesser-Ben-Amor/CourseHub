# Build-Stage
FROM maven:3.8.6-eclipse-temurin-17 as build

WORKDIR /app

# Kopiere pom.xml
COPY pom.xml .

# Lade Abhängigkeiten herunter
RUN mvn dependency:go-offline -B

# Kopiere den Quellcode
COPY src ./src

# Baue die Anwendung
RUN mvn package -DskipTests

# Production-Stage
FROM eclipse-temurin:17-jre

WORKDIR /app

# Kopiere die gebaute JAR-Datei aus der Build-Stage
COPY --from=build /app/target/*.jar app.jar

# Port freigeben
EXPOSE 8080

# Anwendung starten
ENTRYPOINT ["java", "-jar", "app.jar"]