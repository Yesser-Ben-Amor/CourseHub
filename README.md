# CourseHub

## Übersicht

CourseHub ist eine Plattform zur Verwaltung von Kursen und Lernmaterialien. Die Anwendung besteht aus einem React-Frontend, einem Spring Boot-Backend und einer MySQL-Datenbank.

## Technologie-Stack

- **Frontend**: React mit TypeScript
- **Backend**: Java Spring Boot
- **Datenbank**: MySQL 8.0
- **Containerisierung**: Docker & Docker Compose

## Voraussetzungen

- Docker und Docker Compose installiert
- Git

## Installation und Start

### 1. Repository klonen

```bash
git clone https://github.com/Yesser-Ben-Amor/CourseHub.git
cd CourseHub
```

### 2. Anwendung mit Docker starten

```bash
docker-compose up -d
```

Die Anwendung ist dann unter folgenden URLs erreichbar:

- Frontend: http://localhost
- API: http://localhost/api.json
- Backend: http://localhost:8080
- Datenbank: localhost:3307 (MySQL-Client erforderlich)

### 3. Container-Status überprüfen

```bash
docker-compose ps
```

### 4. Logs anzeigen

```bash
# Alle Logs
docker-compose logs

# Nur Frontend-Logs
docker-compose logs frontend

# Nur Backend-Logs
docker-compose logs backend

# Nur Datenbank-Logs
docker-compose logs db
```

## Entwicklung

### Lokale Entwicklung

Für die lokale Entwicklung ohne Docker:

#### Frontend

```bash
cd frontend
npm install
npm start
```

#### Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Mit Docker

Änderungen an den Dockerfiles oder der docker-compose.yml erfordern einen Neustart der Container:

```bash
docker-compose down
docker-compose build
docker-compose up -d
```

## Datenbank

Die MySQL-Datenbank ist über Port 3307 erreichbar:

- **Host**: localhost
- **Port**: 3307
- **Benutzer**: coursehub
- **Passwort**: password
- **Datenbank**: coursehub

## Projektstruktur

```
CourseHub/
├── frontend/           # React-Frontend
│   ├── src/            # Quellcode
│   ├── Dockerfile      # Docker-Konfiguration für Frontend
│   └── nginx.conf      # Nginx-Konfiguration
├── backend/            # Spring Boot-Backend
│   ├── src/            # Quellcode
│   └── Dockerfile      # Docker-Konfiguration für Backend
└── docker-compose.yml  # Docker Compose Konfiguration
```

## Fehlerbehebung

### Container startet nicht

Überprüfen Sie die Logs:

```bash
docker-compose logs [service_name]
```

### Port-Konflikte

Wenn Ports bereits belegt sind, ändern Sie die Ports in der docker-compose.yml:

```yaml
ports:
  - "8000:80"  # Ändert den externen Port von 80 auf 8000
```

## Lizenz

[MIT](https://opensource.org/licenses/MIT)
