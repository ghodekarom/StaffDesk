# StaffDesk Backend

Spring Boot 4.1 REST API for the StaffDesk Employee Management System.

## Stack
- Java 21, Spring Boot 4.1
- Spring Web, Spring Data JPA, Spring Security
- PostgreSQL + Flyway (migrations live in `src/main/resources/db/migration`)
- JWT auth (jjwt)
- springdoc-openapi (Swagger UI)

## Running locally

1. Copy `.env.example` to `.env` and fill in real values (or export as env vars)
2. Make sure Postgres is running and a `staffdesk_db` database exists
3. Run:
```bash
export $(cat .env | xargs)   # or use your IDE's env var support
./mvnw spring-boot:run
```
4. Flyway runs migrations automatically on startup — no manual `psql` step needed once the app boots
5. API available at `http://localhost:8080`
6. Swagger UI at `http://localhost:8080/swagger-ui.html`

## Package structure

Each business module follows `controller/ → service/ → repository/ → entity/ → dto/`:

```
com.staffdesk.ems
├── employee/
├── auth/         (controller/service/dto/security)
├── attendance/
├── leave/
├── department/
├── common/       (shared exceptions, base entities, DTOs)
└── config/       (SecurityConfig, CORS, Swagger config)
```

## Current status
- Project scaffolded, dependencies wired, Phase 1 schema applied via Flyway
- Baseline `SecurityConfig` in place (stateless, public auth/swagger endpoints) — JWT filter not yet implemented
- Entities/repositories/controllers for employee, department, attendance, leave: **not yet built**

## Next steps
1. Build `employee` module: entity → repository → service → controller (CRUD)
2. Build `auth` module: JWT filter, login endpoint, password hashing
3. Repeat for `department`, `attendance`, `leave`
