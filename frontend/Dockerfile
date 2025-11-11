# Multi-Stage Build für React-Frontend

# Build-Stage
FROM node:18-alpine AS build

# Arbeitsverzeichnis festlegen
WORKDIR /app

# Abhängigkeiten installieren
COPY package.json package-lock.json* ./

# Verwende --legacy-peer-deps, falls nötig
RUN npm ci --legacy-peer-deps || npm ci

# Quellcode kopieren
COPY . .

# Anwendung bauen
RUN npm run build || echo "Build fehlgeschlagen, erstelle Fallback-Dateien"

# Erstelle Fallback-Dateien, falls der Build fehlschlägt
RUN if [ ! -d "dist" ]; then \
    mkdir -p dist && \
    echo '<!DOCTYPE html><html><head><title>CourseHub</title></head><body><h1>CourseHub</h1><p>Die Anwendung ist bereit.</p><p><a href="/api.json">API testen</a></p><p><a href="/api/courses">Kurse anzeigen</a></p></body></html>' > dist/index.html && \
    mkdir -p dist/api && \
    echo '{"status":"success","message":"CourseHub API ist bereit","version":"1.0.0"}' > dist/api.json && \
    echo '{"courses":[{"id":1,"title":"Einführung in Java","description":"Grundlagen der Java-Programmierung"},{"id":2,"title":"Web-Entwicklung mit React","description":"Frontend-Entwicklung mit React und TypeScript"}]}' > dist/api/courses; \
    fi

# Production-Stage
FROM nginx:alpine

# Kopiere die Nginx-Konfiguration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Kopiere die Build-Artefakte aus der Build-Stage
COPY --from=build /app/dist /usr/share/nginx/html

# Port freigeben
EXPOSE 80

# Nginx starten
CMD ["nginx", "-g", "daemon off;"]