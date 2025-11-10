# Build-Stage
FROM node:16-alpine as build

WORKDIR /app

# Kopiere package.json und package-lock.json
COPY package*.json ./

# Installiere Abhängigkeiten
RUN npm ci

# Kopiere den Quellcode
COPY . .

# Baue die Anwendung
RUN npm run build

# Production-Stage
FROM nginx:alpine

# Kopiere die gebaute Anwendung aus der Build-Stage
COPY --from=build /app/dist /usr/share/nginx/html

# Kopiere die Nginx-Konfiguration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Port freigeben
EXPOSE 80

# Nginx starten
CMD ["nginx", "-g", "daemon off;"]