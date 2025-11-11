# Einfaches Nginx-Image
FROM nginx:alpine

# Erstelle das HTML-Verzeichnis
RUN mkdir -p /usr/share/nginx/html

# Kopiere die Nginx-Konfiguration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Erstelle eine einfache index.html
RUN echo '<!DOCTYPE html><html><head><title>CourseHub</title></head><body><h1>CourseHub</h1><p>Die Anwendung ist bereit.</p><p><a href="/api.json">API testen</a></p><p><a href="/api/courses">Kurse anzeigen</a></p></body></html>' > /usr/share/nginx/html/index.html

# Erstelle API-JSON-Dateien
RUN mkdir -p /usr/share/nginx/html/api
RUN echo '{"status":"success","message":"CourseHub API ist bereit","version":"1.0.0"}' > /usr/share/nginx/html/api.json
RUN echo '{"courses":[{"id":1,"title":"Einführung in Java","description":"Grundlagen der Java-Programmierung"},{"id":2,"title":"Web-Entwicklung mit React","description":"Frontend-Entwicklung mit React und TypeScript"}]}' > /usr/share/nginx/html/api/courses

# Port freigeben
EXPOSE 80

# Nginx starten
CMD ["nginx", "-g", "daemon off;"]