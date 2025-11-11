# Einfaches Nginx-Image
FROM nginx:alpine

# Erstelle das HTML-Verzeichnis
RUN mkdir -p /usr/share/nginx/html

# Kopiere die Nginx-Konfiguration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Kopiere die statischen Dateien (falls vorhanden)
COPY ./src /usr/share/nginx/html/
COPY ./public /usr/share/nginx/html/

# Erstelle eine einfache index.html, falls keine vorhanden ist
RUN if [ ! -f /usr/share/nginx/html/index.html ]; then \
    echo '<!DOCTYPE html><html><head><title>CourseHub</title></head><body><h1>CourseHub</h1><p>Die Anwendung ist bereit.</p><p><a href="/api.json">API testen</a></p></body></html>' > /usr/share/nginx/html/index.html; \
    fi

# Erstelle eine API-JSON-Datei
RUN echo '{"status":"success","message":"CourseHub API ist bereit","version":"1.0.0"}' > /usr/share/nginx/html/api.json

# Port freigeben
EXPOSE 80

# Nginx starten
CMD ["nginx", "-g", "daemon off;"]