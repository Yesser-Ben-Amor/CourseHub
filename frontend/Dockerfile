# Einfaches Nginx-Image
FROM nginx:alpine

# Kopiere die Nginx-Konfiguration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Erstelle eine einfache index.html
RUN echo '<!DOCTYPE html><html><head><title>CourseHub</title><style>body{font-family:Arial,sans-serif;margin:40px;line-height:1.6}h1{color:#2c3e50}a{color:#3498db}</style></head><body><h1>CourseHub</h1><p>Die Anwendung ist erfolgreich gestartet!</p><p><a href="/api.json">API-Status testen</a></p><p><a href="/api/courses">Kursliste anzeigen</a></p></body></html>' > /usr/share/nginx/html/index.html

# Erstelle API-JSON-Dateien
RUN mkdir -p /usr/share/nginx/html/api
RUN echo '{"status":"success","message":"CourseHub API ist bereit","version":"1.0.0"}' > /usr/share/nginx/html/api.json
RUN echo '{"courses":[{"id":1,"title":"Einführung in Java","description":"Grundlagen der Java-Programmierung"},{"id":2,"title":"Web-Entwicklung mit React","description":"Frontend-Entwicklung mit React und TypeScript"}]}' > /usr/share/nginx/html/api/courses

# Port freigeben
EXPOSE 80

# Nginx starten
CMD ["nginx", "-g", "daemon off;"]