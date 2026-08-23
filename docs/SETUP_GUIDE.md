# Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Java 21 (matches `backend/pom.xml`'s `<java.version>`)
- Maven (or the included `./mvnw` wrapper — no local Maven install needed)
- A running PostgreSQL instance, with a `staffdesk_db` database created
- Docker (optional, for the containerized backend)

## Backend setup

```bash
cd backend
cp .env.example .env        # fill in real values, see below
export $(cat .env | xargs)  # or use your IDE's env var support
./mvnw spring-boot:run
```

Flyway runs all migrations automatically on startup — no manual `psql` step
needed. The API starts on `http://localhost:8080` by default; Swagger UI is at
`http://localhost:8080/swagger-ui.html`.

### Backend environment variables

`backend/.env.example` ships with three:

```
DB_USER=staffdesk_user
DB_PASSWORD=1234
JWT_SECRET=<a real random secret — the example value is not one>
```

`application.yml` also reads (with defaults shown, all overridable):

| Variable | Default | Notes |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/staffdesk_db` | JDBC connection string |
| `DB_USER` | `postgres` | |
| `DB_PASSWORD` | `1234` | Change for anything beyond local dev |
| `DB_POOL_SIZE` | `5` | HikariCP max pool size |
| `DB_DIRECT_URL` | *(required, no default)* | Used by Flyway specifically — must be set |
| `PORT` | `8080` | |
| `JWT_SECRET` | placeholder string | **Must** be overridden outside local dev |
| `JWT_EXPIRATION_MS` | `3600000` (1 hour) | Access token TTL |
| `JWT_REFRESH_EXPIRATION_MS` | `604800000` (7 days) | Refresh token TTL |

`application.yml` currently has `debug: true` at the top level — worth turning
off for anything beyond local development.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`.

### Frontend environment variables

`frontend/.env.local`:

```
# Server-side only (BFF routes: login/refresh/logout). Never sent to the browser.
BACKEND_API_BASE_URL=http://localhost:8080/api/v1

# Client-side, used by lib/api.ts for authenticated calls directly to the backend.
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

Keep these as two separate variables even though they point to the same place
locally — that separation is what keeps the refresh token from ever being
fetchable client-side by accident. See
[`ARCHITECTURE.md`](./ARCHITECTURE.md#auth-flow-bff-pattern) for the full auth
flow this supports.

## Running with Docker (backend only)

```bash
cd backend
docker build -t staffdesk-backend .
docker run -p 8080:8080 --env-file .env staffdesk-backend
```

Multi-stage build: Maven build stage → slim `eclipse-temurin:21-jre-alpine`
runtime, runs as a non-root user, reads `$PORT` at runtime (Render-compatible).
There's no Docker setup for the frontend or a `docker-compose.yml` tying
frontend + backend + Postgres together yet — see
[`STATUS_AND_ROADMAP.md`](./STATUS_AND_ROADMAP.md).

## Testing

Backend (JUnit 5 + Mockito):

```bash
cd backend
./mvnw test
```

Nine test classes today, concentrated in payroll calculation logic
(PF/ESI/Professional Tax/TDS calculators), employee service, notification
service + preferences, the payroll run service, and the attendance reminder
scheduler. No frontend test setup exists yet (no Jest/RTL config despite being
mentioned as a target stack).

## Logging in locally

If you ran the V4 seed migration (the default), every seeded user shares one
password — see the comment in
`backend/src/main/resources/db/migration/V4__phase1_schema.sql` for the
credential. The CEO account (`employee_code = 'EMP0001'`) has `ADMIN` role;
department heads get `MANAGER`; Human Resources department staff get `HR`;
everyone else gets `EMPLOYEE`.
