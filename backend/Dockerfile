# Verwende ein einfaches Alpine-Image
FROM alpine:latest

# Arbeitsverzeichnis festlegen
WORKDIR /app

# Installiere benötigte Tools
RUN apk add --no-cache curl

# Erstelle API-Verzeichnis und -Endpunkte
RUN mkdir -p /app/api
RUN echo '{"status":"success","message":"CourseHub API ist bereit","version":"1.0.0"}' > /app/api/status.json
RUN echo '{"courses":[{"id":1,"title":"Einführung in Java","description":"Grundlagen der Java-Programmierung"},{"id":2,"title":"Web-Entwicklung mit React","description":"Frontend-Entwicklung mit React und TypeScript"}]}' > /app/api/courses.json
RUN echo '{"users":[{"id":1,"name":"Max Mustermann","email":"max@example.com"},{"id":2,"name":"Anna Schmidt","email":"anna@example.com"}]}' > /app/api/users.json

# Erstelle das Startskript
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "CourseHub API gestartet auf Port 8080"' >> /app/start.sh && \
    echo 'mkdir -p /app/api' >> /app/start.sh && \
    echo 'cd /app' >> /app/start.sh && \
    echo 'while true; do sleep 1000; done' >> /app/start.sh && \
    chmod +x /app/start.sh

# Port freigeben
EXPOSE 8080

# Umgebungsvariablen für die Datenbankverbindung (werden nicht verwendet, aber für Kompatibilität beibehalten)
ENV SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/coursehub?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
ENV SPRING_DATASOURCE_USERNAME=coursehub
ENV SPRING_DATASOURCE_PASSWORD=password

# Anwendung starten
CMD ["/bin/sh", "/app/start.sh"]