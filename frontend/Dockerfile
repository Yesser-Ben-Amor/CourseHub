# Einfache Nginx-Lösung ohne Build-Prozess
FROM nginx:alpine

# Erstelle das HTML-Verzeichnis
RUN mkdir -p /usr/share/nginx/html

# Erstelle eine einfache index.html
RUN echo '<!DOCTYPE html><html><head><title>CourseHub</title></head><body><h1>CourseHub</h1><p>Die Anwendung ist bereit.</p><p><a href="/api.json">API testen</a></p></body></html>' > /usr/share/nginx/html/index.html

# Erstelle eine einfache API-JSON-Datei
RUN echo '{"status":"success","message":"CourseHub API ist bereit","version":"1.0.0"}' > /usr/share/nginx/html/api.json

# Port freigeben
EXPOSE 80

# Nginx starten
CMD ["nginx", "-g", "daemon off;"]