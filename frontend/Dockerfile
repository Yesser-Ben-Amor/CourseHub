# Multi-Stage Build für React-Frontend

# Build-Stage
FROM node:18-alpine AS build

# Arbeitsverzeichnis festlegen
WORKDIR /app

# Abhängigkeiten installieren
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Quellcode kopieren
COPY . .

# Anwendung bauen
RUN npm run build

# Production-Stage
FROM nginx:alpine

# Nginx-Konfiguration kopieren
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build-Artefakte aus der Build-Stage kopieren
COPY --from=build /app/dist /usr/share/nginx/html

# Fallback API-JSON-Datei erstellen (falls die API nicht erreichbar ist)
RUN echo '{"status":"success","message":"CourseHub API ist bereit","version":"1.0.0"}' > /usr/share/nginx/html/api.json

# Port freigeben
EXPOSE 80

# Nginx starten
CMD ["nginx", "-g", "daemon off;"]