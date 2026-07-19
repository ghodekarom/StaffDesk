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
- **`employee` module: done** — entity, repository, service (interface + impl), controller (full CRUD, paginated list), request/response DTOs, unit tests
- Minimal `Department` entity/repository added (just enough for the employee FK relationship — full department module still pending)
- `/api/v1/employees/**` is temporarily public in `SecurityConfig` (see TODO comment there) until the JWT filter exists — **do not ship this open to anything but local dev**
- `auth`, `attendance`, `leave` modules: **not yet built**

## Employee API (available now)
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/employees` | Create employee |
| GET | `/api/v1/employees/{id}` | Get one employee |
| GET | `/api/v1/employees?page=0&size=20&sort=lastName,asc` | List (paginated) |
| PUT | `/api/v1/employees/{id}` | Update employee |
| DELETE | `/api/v1/employees/{id}` | Delete employee |

Try it via Swagger UI once running: `http://localhost:8080/swagger-ui.html`

## Next steps
1. Build `auth` module: JWT filter, login endpoint, password hashing — then lock `/api/v1/employees/**` back down
2. Build `department` module properly (currently just a stub entity)
3. Build `attendance` and `leave` modules
