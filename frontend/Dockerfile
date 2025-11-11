# Development-Stage für React-Frontend mit Vite

FROM node:18-alpine

# Arbeitsverzeichnis festlegen
WORKDIR /app

# Abhängigkeiten installieren
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps || npm ci || npm install

# Kopiere den Quellcode
COPY . .

# Port freigeben
EXPOSE 5173

# Umgebungsvariablen für die API-URL
ENV VITE_API_URL=http://localhost:8080/api

# Starte den Entwicklungsserver
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]