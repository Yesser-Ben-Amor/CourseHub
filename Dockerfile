


# Multi-Stage Build für die gesamte CourseHub-Anwendung

# Stage 1: Frontend bauen
FROM node:18.17-alpine AS frontend-build
WORKDIR /app/frontend
# Verwende ADD für package.json-Dateien
ADD frontend/package*.json ./
RUN npm ci --legacy-peer-deps || npm ci || npm install
# Verwende ADD für den gesamten Frontend-Quellcode
ADD frontend/ ./
RUN npm run build

# Stage 2: Backend bauen
FROM maven:3.8.7-eclipse-temurin-17 AS backend-build
WORKDIR /app/backend
# Verwende ADD für pom.xml
ADD backend/pom.xml .
RUN mvn dependency:go-offline -B
# Verwende ADD für den Backend-Quellcode
ADD backend/src ./src
RUN mvn package -DskipTests

# Stage 3: Finale Image
FROM eclipse-temurin:17-jre
WORKDIR /app

# Backend JAR kopieren
COPY --from=backend-build /app/backend/target/*.jar app.jar

# Frontend-Build in den statischen Ordner des Backends kopieren
RUN mkdir -p /app/src/main/resources/static
COPY --from=frontend-build /app/frontend/dist/ /app/src/main/resources/static/

# Konfigurationsdateien hinzufügen (falls vorhanden)
ADD config/ /app/config/

# Port freigeben
EXPOSE 8080



# Anwendung starten
CMD ["java", "-jar", "app.jar"]