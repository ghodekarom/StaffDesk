-- ============================================================
-- Employee Management System — Phase 1 Schema
-- Modules: employees, departments, users/auth, attendance, leave
-- ============================================================

-- ---------- DEPARTMENTS ----------
CREATE TABLE departments (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    head_employee_id BIGINT,           -- FK added after employees table exists
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- EMPLOYEES ----------
CREATE TABLE employees (
    id              BIGSERIAL PRIMARY KEY,
    employee_code   VARCHAR(20) NOT NULL UNIQUE,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    phone           VARCHAR(20),
    department_id   BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    manager_id      BIGINT REFERENCES employees(id) ON DELETE SET NULL,  -- self-referencing
    designation     VARCHAR(100),
    date_of_joining DATE NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'INACTIVE', 'TERMINATED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by      BIGINT,
    updated_by      BIGINT
);

CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_manager ON employees(manager_id);
CREATE INDEX idx_employees_status ON employees(status);

-- Now that employees exists, wire up the department -> head_employee FK
ALTER TABLE departments
    ADD CONSTRAINT fk_department_head
    FOREIGN KEY (head_employee_id) REFERENCES employees(id) ON DELETE SET NULL;

-- ---------- USERS (auth) ----------
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    employee_id     BIGINT NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL
                    CHECK (role IN ('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')),
    last_login_at   TIMESTAMPTZ,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- ATTENDANCE ----------
CREATE TABLE attendance (
    id              BIGSERIAL PRIMARY KEY,
    employee_id     BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    clock_in        TIMESTAMPTZ,
    clock_out       TIMESTAMPTZ,
    status          VARCHAR(20) NOT NULL DEFAULT 'PRESENT'
                    CHECK (status IN ('PRESENT', 'ABSENT', 'HALF_DAY', 'LATE')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (employee_id, attendance_date)   -- one record per employee per day
);

CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, attendance_date);

-- ---------- LEAVE ----------
CREATE TABLE leave_requests (
    id              BIGSERIAL PRIMARY KEY,
    employee_id     BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type      VARCHAR(20) NOT NULL
                    CHECK (leave_type IN ('SICK', 'CASUAL', 'EARNED')),
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approved_by     BIGINT REFERENCES employees(id) ON DELETE SET NULL,
    reason          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (end_date >= start_date)
);

CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);

CREATE TABLE leave_balances (
    id              BIGSERIAL PRIMARY KEY,
    employee_id     BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type      VARCHAR(20) NOT NULL
                    CHECK (leave_type IN ('SICK', 'CASUAL', 'EARNED')),
    year            INT NOT NULL,
    total           NUMERIC(5,1) NOT NULL DEFAULT 0,
    used            NUMERIC(5,1) NOT NULL DEFAULT 0,
    remaining       NUMERIC(5,1) GENERATED ALWAYS AS (total - used) STORED,
    UNIQUE (employee_id, leave_type, year)
);

-- ============================================================
-- End of Phase 1 schema
-- Next migration (V2) will add payroll + performance tables
-- ============================================================
