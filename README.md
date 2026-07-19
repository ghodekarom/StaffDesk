# Employee Management System (EMS)

A web application for managing employee records, attendance, leave, payroll, and performance.

## Tech Stack
- **Frontend:** Next.js + Tailwind CSS
- **Backend:** Java Spring Boot (Spring Web, Spring Data JPA, Spring Security)
- **Database:** PostgreSQL
- **Auth:** JWT (role-based: Admin, HR, Manager, Employee)

Full architecture and conventions: see [`docs/EMS-Project-Documentation.md`](./docs/EMS-Project-Documentation.md)

## Repo Structure
```
ems/
├── backend/    Spring Boot API
├── frontend/   Next.js app
├── db/
│   └── migrations/   Flyway-style SQL migrations (source of truth for schema)
└── docs/       Project documentation
```

## Getting Started

### Prerequisites
- Java 17+
- Node.js 20+
- PostgreSQL 15+ (or Docker)
- Maven

### Database
```bash
# Using Docker
docker run --name ems-postgres -e POSTGRES_DB=ems_db \
  -e POSTGRES_USER=ems_user -e POSTGRES_PASSWORD=changeme \
  -p 5432:5432 -d postgres:16

# Apply schema
psql -h localhost -U ems_user -d ems_db -f db/migrations/V1__phase1_schema.sql
```

### Backend
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Development Status
See [Project Board / Issues] for current progress. Phase 1 (core: employees, departments, attendance, leave) is in progress.

## Contributing
- Branch naming: `feature/<short-description>`, `fix/<short-description>`
- Commit convention: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`)
- All changes go through PR into `develop`, never direct to `main`
