# StaffDesk — Employee Management System (EMS)

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

StaffDesk is a full-stack Employee Management System that helps organizations manage employees, departments, attendance, and leave — all from a single, modern dashboard.

**Live Demo:** [https://staffdesk-ashy.vercel.app/](https://staffdesk-ashy.vercel.app/)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [Testing](#testing)
- [Project Status](#project-status)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

StaffDesk (internally, `ems` — Employee Management System) is split into two independently deployable services:

- **`frontend/`** — a Next.js 14 (App Router) dashboard consumed by admins, managers, and employees.
- **`backend/`** — a Spring Boot REST API handling auth, business logic, and persistence, versioned with Flyway migrations.

## Features

- 🔐 **Authentication** — JWT-based login, token refresh, and route protection via middleware
- 👥 **Employee Management** — create, view, update employee records
- 🏢 **Department Management** — manage departments and assign department heads
- 🕒 **Attendance Tracking** — clock-in/out widget, personal and team attendance views, manual overrides
- 🌴 **Leave Management** — submit leave requests, track balances, approve/reject as a manager, team leave view
- 📊 **Dashboard & Analytics** — overview page with charts (via Recharts) summarizing key metrics
- 🎨 **Modern UI/UX** — command palette, toast notifications, dark/light theme toggle, responsive design with Tailwind CSS and Framer Motion animations

## Tech Stack

**Frontend**
- [Next.js 14](https://nextjs.org/) (App Router) + React 18 + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animation
- [Recharts](https://recharts.org/) for data visualization
- [Lucide React](https://lucide.dev/) for icons

**Backend**
- Java + [Spring Boot](https://spring.io/projects/spring-boot)
- Spring Security with JWT authentication
- Spring Data JPA
- [Flyway](https://flywaydb.org/) for database migrations
- Maven (with Maven Wrapper)

**Database**
- Relational database (managed via Spring Data JPA + Flyway migrations)

**Deployment**
- Frontend: [Vercel](https://vercel.com/)
- Backend: Dockerized Spring Boot service (see `backend/Dockerfile`)

## Project Structure

```
staffdesk/
├── backend/                          # Spring Boot REST API
│   ├── src/main/java/com/staffdesk/ems/
│   │   ├── auth/                     # Authentication & JWT security
│   │   ├── employee/                 # Employee CRUD
│   │   ├── department/               # Department management
│   │   ├── attendance/                # Attendance tracking
│   │   ├── leave/                    # Leave requests & balances
│   │   └── common/                   # Shared exceptions & DTOs
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/             # Flyway SQL migrations
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                         # Next.js dashboard
│   ├── app/
│   │   ├── (auth)/login/             # Login page
│   │   ├── (dashboard)/              # Protected dashboard routes
│   │   │   ├── overview/
│   │   │   ├── employees/
│   │   │   ├── departments/
│   │   │   ├── attendance/
│   │   │   └── leave/
│   │   └── api/auth/                 # Auth API routes (login/logout/refresh)
│   ├── components/                   # Feature & UI components
│   ├── lib/                          # API client, auth context, config
│   ├── types/                        # Shared TypeScript types
│   └── package.json
│
├── docs/                             # Project documentation
└── db/migrations/                    # Root-level DB migrations
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Java 17+ (or the version specified in `backend/pom.xml`)
- Maven (or use the included `mvnw` wrapper)
- A running relational database instance
- Docker (optional, for containerized backend)

### Backend Setup

```bash
cd backend
cp .env.example .env        # fill in your database & JWT config
./mvnw clean install
./mvnw spring-boot:run
```

The API will start on the port configured in `application.yml` (commonly `http://localhost:8080`).

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

## Environment Variables

**Backend** (`backend/.env` — see `backend/.env.example`)

```
DATABASE_URL=
DATABASE_USERNAME=
DATABASE_PASSWORD=
JWT_SECRET=
JWT_EXPIRATION=
```

**Frontend** (`frontend/.env.local`)

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

> Adjust variable names to match what's actually declared in `backend/.env.example` and your API client (`frontend/lib/api.ts`).

## Running with Docker

```bash
cd backend
docker build -t staffdesk-backend .
docker run -p 8080:8080 --env-file .env staffdesk-backend
```

## Testing

Backend unit tests (JUnit):

```bash
cd backend
./mvnw test
```

## Project Status

🚧 **Actively in development.** Core modules — authentication, employee management, department management, attendance tracking, and leave management — are implemented end-to-end (frontend + backend) with a functional dashboard UI.

## Roadmap

- [ ] Role-based access control refinements
- [ ] Notifications / email integration
- [ ] Reporting & exports (CSV/PDF)
- [ ] CI/CD pipeline
- [ ] Expanded test coverage

## Contributing

Contributions are welcome! Please open an issue to discuss significant changes before submitting a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch and open a Pull Request

## License

This project currently has no explicit license file. Add a `LICENSE` file (e.g., MIT) if you intend to open-source this project.
