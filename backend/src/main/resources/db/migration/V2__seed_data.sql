-- ============================================================
-- Employee Management System — Phase 1 Seed Data
-- Populates: departments, employees, users, attendance, leave
-- ============================================================

-- ---------- DEPARTMENTS (head_employee_id set later) ----------
INSERT INTO departments (name) VALUES
    ('Engineering'),
    ('Human Resources'),
    ('Sales'),
    ('Finance'),
    ('Operations');

-- ---------- EMPLOYEES ----------
-- Managers/dept heads first (manager_id NULL), then their reports
INSERT INTO employees (employee_code, first_name, last_name, email, phone, department_id, manager_id, designation, date_of_joining, status)
VALUES
    ('EMP001', 'Alice',  'Johnson',  'alice.johnson@staffdesk.com',  '9800000001',
        (SELECT id FROM departments WHERE name = 'Engineering'), NULL, 'Engineering Manager', '2022-01-10', 'ACTIVE'),
    ('EMP004', 'David',  'Wilson',   'david.wilson@staffdesk.com',   '9800000004',
        (SELECT id FROM departments WHERE name = 'Human Resources'), NULL, 'HR Manager', '2021-06-01', 'ACTIVE'),
    ('EMP006', 'Frank',  'Miller',   'frank.miller@staffdesk.com',   '9800000006',
        (SELECT id FROM departments WHERE name = 'Sales'), NULL, 'Sales Manager', '2021-03-15', 'ACTIVE'),
    ('EMP008', 'Henry',  'Taylor',   'henry.taylor@staffdesk.com',   '9800000008',
        (SELECT id FROM departments WHERE name = 'Finance'), NULL, 'Finance Manager', '2020-11-20', 'ACTIVE'),
    ('EMP010', 'Jack',   'Thomas',   'jack.thomas@staffdesk.com',    '9800000010',
        (SELECT id FROM departments WHERE name = 'Operations'), NULL, 'Operations Manager', '2022-04-05', 'ACTIVE');

INSERT INTO employees (employee_code, first_name, last_name, email, phone, department_id, manager_id, designation, date_of_joining, status)
VALUES
    ('EMP002', 'Bob',    'Smith',    'bob.smith@staffdesk.com',      '9800000002',
        (SELECT id FROM departments WHERE name = 'Engineering'),
        (SELECT id FROM employees WHERE employee_code = 'EMP001'), 'Software Engineer', '2022-07-18', 'ACTIVE'),
    ('EMP003', 'Carol',  'Davis',    'carol.davis@staffdesk.com',    '9800000003',
        (SELECT id FROM departments WHERE name = 'Engineering'),
        (SELECT id FROM employees WHERE employee_code = 'EMP001'), 'Software Engineer', '2023-02-14', 'ACTIVE'),
    ('EMP005', 'Eve',    'Brown',    'eve.brown@staffdesk.com',      '9800000005',
        (SELECT id FROM departments WHERE name = 'Human Resources'),
        (SELECT id FROM employees WHERE employee_code = 'EMP004'), 'HR Executive', '2023-05-22', 'ACTIVE'),
    ('EMP007', 'Grace',  'Lee',      'grace.lee@staffdesk.com',      '9800000007',
        (SELECT id FROM departments WHERE name = 'Sales'),
        (SELECT id FROM employees WHERE employee_code = 'EMP006'), 'Sales Executive', '2023-01-09', 'ACTIVE'),
    ('EMP009', 'Ivy',    'Anderson', 'ivy.anderson@staffdesk.com',   '9800000009',
        (SELECT id FROM departments WHERE name = 'Finance'),
        (SELECT id FROM employees WHERE employee_code = 'EMP008'), 'Accountant', '2022-09-30', 'ACTIVE');

-- ---------- WIRE UP DEPARTMENT HEADS ----------
UPDATE departments SET head_employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP001') WHERE name = 'Engineering';
UPDATE departments SET head_employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP004') WHERE name = 'Human Resources';
UPDATE departments SET head_employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP006') WHERE name = 'Sales';
UPDATE departments SET head_employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP008') WHERE name = 'Finance';
UPDATE departments SET head_employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP010') WHERE name = 'Operations';

-- ---------- USERS (auth accounts) ----------
-- All seeded users share the password: Password123!
-- Hash generated with BCrypt (10 rounds) — works directly with Spring Security's BCryptPasswordEncoder
INSERT INTO users (employee_id, email, password_hash, role, is_active)
VALUES
    ((SELECT id FROM employees WHERE employee_code = 'EMP001'), 'alice.johnson@staffdesk.com', '$2b$10$2yZkj6/hlkTL73HavvEnNucB0pcgu4h21SBjyzE8KjRbYa0ecJ0M2', 'ADMIN',   true),
    ((SELECT id FROM employees WHERE employee_code = 'EMP004'), 'david.wilson@staffdesk.com',  '$2b$10$2yZkj6/hlkTL73HavvEnNucB0pcgu4h21SBjyzE8KjRbYa0ecJ0M2', 'HR',      true),
    ((SELECT id FROM employees WHERE employee_code = 'EMP006'), 'frank.miller@staffdesk.com',  '$2b$10$2yZkj6/hlkTL73HavvEnNucB0pcgu4h21SBjyzE8KjRbYa0ecJ0M2', 'MANAGER', true),
    ((SELECT id FROM employees WHERE employee_code = 'EMP002'), 'bob.smith@staffdesk.com',     '$2b$10$2yZkj6/hlkTL73HavvEnNucB0pcgu4h21SBjyzE8KjRbYa0ecJ0M2', 'EMPLOYEE',true),
    ((SELECT id FROM employees WHERE employee_code = 'EMP007'), 'grace.lee@staffdesk.com',     '$2b$10$2yZkj6/hlkTL73HavvEnNucB0pcgu4h21SBjyzE8KjRbYa0ecJ0M2', 'EMPLOYEE',true);

-- ---------- ATTENDANCE (last 5 weekdays for a couple of employees) ----------
INSERT INTO attendance (employee_id, attendance_date, clock_in, clock_out, status)
SELECT
    e.id,
    d::date,
    (d::date + TIME '09:15:00') AT TIME ZONE 'Asia/Kolkata',
    (d::date + TIME '18:05:00') AT TIME ZONE 'Asia/Kolkata',
    'PRESENT'
FROM employees e
CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE, INTERVAL '1 day') AS d
WHERE e.employee_code IN ('EMP002', 'EMP003', 'EMP007')
  AND EXTRACT(ISODOW FROM d) < 6;  -- weekdays only

-- ---------- LEAVE REQUESTS ----------
INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, status, approved_by, reason)
VALUES
    ((SELECT id FROM employees WHERE employee_code = 'EMP002'), 'SICK',   CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '9 days',
        'APPROVED', (SELECT id FROM employees WHERE employee_code = 'EMP001'), 'Fever and cold'),
    ((SELECT id FROM employees WHERE employee_code = 'EMP007'), 'CASUAL', CURRENT_DATE + INTERVAL '5 days',  CURRENT_DATE + INTERVAL '5 days',
        'PENDING',  NULL, 'Family function'),
    ((SELECT id FROM employees WHERE employee_code = 'EMP003'), 'EARNED', CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '24 days',
        'PENDING',  NULL, 'Planned vacation');

-- ---------- LEAVE BALANCES (current year, all employees) ----------
INSERT INTO leave_balances (employee_id, leave_type, year, total, used)
SELECT e.id, lt.leave_type, EXTRACT(YEAR FROM CURRENT_DATE)::int, lt.total, 0
FROM employees e
CROSS JOIN (VALUES ('SICK', 12.0), ('CASUAL', 12.0), ('EARNED', 15.0)) AS lt(leave_type, total);

-- Reflect the approved/used leave for EMP002 (2 days SICK)
UPDATE leave_balances
SET used = 2.0
WHERE employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP002')
  AND leave_type = 'SICK'
  AND year = EXTRACT(YEAR FROM CURRENT_DATE)::int;

-- ============================================================
-- End of seed data
-- ============================================================
