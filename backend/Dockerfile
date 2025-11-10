# Verwende ein einfaches Alpine-Linux-Image
FROM alpine:latest

WORKDIR /app

# Erstelle eine einfache Info-Datei
RUN echo "CourseHub API - Dummy-Anwendung" > info.txt

# Erstelle ein einfaches Shell-Skript
RUN echo '#!/bin/sh' > start.sh && \
    echo 'echo "CourseHub API - Dummy-Anwendung"' >> start.sh && \
    echo 'echo "Dies ist eine Platzhalter-API. Das Backend läuft auf Port 8080."' >> start.sh && \
    echo 'while true; do sleep 1000; done' >> start.sh && \
    chmod +x start.sh

# Port freigeben
EXPOSE 8080

# Anwendung starten
ENTRYPOINT ["/bin/sh", "start.sh"]