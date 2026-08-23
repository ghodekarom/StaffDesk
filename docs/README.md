# StaffDesk Documentation

StaffDesk is a full-stack Employee Management System (internally `ems`): a Next.js
dashboard on top of a Spring Boot REST API, covering employee records, departments,
attendance, leave, payroll, internal messaging, and notifications.

This folder is the current, code-derived documentation set. Everything here was
written by reading the actual `backend/` and `frontend/` source, not by copying
whatever was previously planned — see [`archive/`](./archive) for the original
pre-build planning doc if you want the history.

## Start here

| Doc | What's in it |
|---|---|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Tech stack, system diagram, module layout, auth flow |
| [`API_REFERENCE.md`](./API_REFERENCE.md) | Every REST endpoint, grouped by module, with roles required |
| [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) | Tables, relationships, and the Flyway migration history that built them |
| [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) | Local dev setup, environment variables, Docker, running tests |
| [`STATUS_AND_ROADMAP.md`](./STATUS_AND_ROADMAP.md) | What's built, what's partial, what's not started, known gaps |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Coding conventions actually used in the codebase, PR workflow |
| [`archive/`](./archive) | Superseded planning docs, kept for reference |

## The one-paragraph version

Two independently-deployable services. `backend/` is a Spring Boot 4.1 (Java 21)
REST API — JWT auth, role-based access (`ADMIN` / `HR` / `MANAGER` / `EMPLOYEE`),
PostgreSQL via Spring Data JPA, schema owned by Flyway migrations. `frontend/` is a
Next.js 14 App Router dashboard using the BFF pattern for auth (refresh token in an
httpOnly cookie, access token in memory). Eight backend modules are implemented
end-to-end: auth, employee, department, attendance, leave, payroll (India-specific:
PF/ESI/TDS/Professional Tax), messaging, and notifications — plus a dashboard
aggregation endpoint. See [`STATUS_AND_ROADMAP.md`](./STATUS_AND_ROADMAP.md) for
exactly what's solid versus rough around the edges.
