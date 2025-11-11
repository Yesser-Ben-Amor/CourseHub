# Verwende ein einfaches Alpine-Linux-Image
FROM alpine:latest

WORKDIR /app

# Erstelle eine einfache Info-Datei
RUN echo "CourseHub API - Dummy-Anwendung" > info.txt

# Erstelle ein einfaches Shell-Skript mit REST-API-Simulation
RUN echo '#!/bin/sh' > start.sh && \
    echo 'echo "CourseHub API - Dummy-Anwendung"' >> start.sh && \
    echo 'echo "Dies ist eine Platzhalter-API. Das Backend läuft auf Port 8080."' >> start.sh && \
    echo 'mkdir -p /tmp/api' >> start.sh && \
    echo 'echo "{\"status\":\"success\",\"message\":\"CourseHub API ist bereit\",\"version\":\"1.0.0\"}" > /tmp/api/status.json' >> start.sh && \
    echo 'echo "{\"courses\":[{\"id\":1,\"title\":\"Einführung in Java\",\"description\":\"Grundlagen der Java-Programmierung\"},{\"id\":2,\"title\":\"Web-Entwicklung mit React\",\"description\":\"Frontend-Entwicklung mit React und TypeScript\"}]}" > /tmp/api/courses.json' >> start.sh && \
    echo 'echo "API-Endpunkte sind bereit unter /api/status und /api/courses"' >> start.sh && \
    echo 'while true; do sleep 1000; done' >> start.sh && \
    chmod +x start.sh

# Port freigeben
EXPOSE 8080

# Anwendung starten
ENTRYPOINT ["/bin/sh", "start.sh"]