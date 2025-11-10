# Einfache Nginx-Lösung ohne Build-Prozess
FROM nginx:stable-alpine

# Erstelle das HTML-Verzeichnis
RUN mkdir -p /usr/share/nginx/html

# Erstelle eine statische index.html (in einer Zeile)
RUN echo '<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>CourseHub</title><style>body{font-family:Arial,sans-serif;background:#0d1117;color:#c9d1d9;margin:0;padding:20px}.container{max-width:800px;margin:40px auto;padding:20px;background:#161b22;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.3)}h1{color:#58a6ff}.btn{display:inline-block;background:#238636;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;margin-top:20px}</style></head><body><div class="container"><h1>CourseHub</h1><p>Die Frontend-Anwendung ist bereit.</p><p>Um die vollständige React-Anwendung zu sehen, bauen Sie sie lokal und ersetzen Sie diese Dateien.</p><p>Das Backend-API ist unter <a href="/api" style="color:#58a6ff">/api</a> erreichbar.</p><a href="/api" class="btn">API testen</a></div></body></html>' > /usr/share/nginx/html/index.html

# Erstelle eine API-Testseite
RUN echo '<!DOCTYPE html><html><head><title>API Test</title></head><body><h1>API Test</h1><p>Dies ist eine Test-API-Seite.</p></body></html>' > /usr/share/nginx/html/api.html

# Kopiere die Frontend-Dateien, falls vorhanden (optional)
COPY ./src /tmp/src/
RUN if [ -d "/tmp/src" ]; then cp -r /tmp/src/* /usr/share/nginx/html/ 2>/dev/null || true; fi

# Kopiere die Nginx-Konfiguration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Port freigeben
EXPOSE 80

# Nginx starten
CMD ["nginx", "-g", "daemon off;"]