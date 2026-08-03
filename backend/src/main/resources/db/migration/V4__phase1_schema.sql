-- ============================================================
-- Employee Management System — V4 Bulk Seed Data
-- Populates: departments, employees, users, attendance,
--            leave_requests, leave_balances, notifications
--
-- ASSUMES: V1__phase1_schema.sql and V3__phase1_schema.sql have
-- already been applied (this migration does not depend on the
-- smaller V2__seed_data.sql — it replaces it with a larger set).
--
-- Row counts (target ~100-200 per table, departments excepted
-- since it is a small reference/lookup table by nature):
--   departments      : 15
--   employees        : 150   (1 CEO + 15 dept heads + 134 staff)
--   users            : ~122  (not every employee has a login)
--   attendance       : ~195  (39 employees x last 5 weekdays)
--   leave_requests   : 150
--   leave_balances   : 180   (60 employees x 3 leave types)
--   notifications    : 160
--
-- Idempotent: truncates all seeded tables (and resets identities)
-- before inserting, so this file can be re-run safely.
-- ============================================================

-- ---------- RESET ----------
TRUNCATE TABLE
    notifications,
    leave_balances,
    leave_requests,
    attendance,
    users,
    employees,
    departments
    RESTART IDENTITY CASCADE;

-- ============================================================
-- DEPARTMENTS (15)
-- ============================================================
INSERT INTO departments (name) VALUES
    ('Engineering'),
    ('Human Resources'),
    ('Sales'),
    ('Finance'),
    ('Operations'),
    ('Marketing'),
    ('Customer Support'),
    ('Legal'),
    ('Product'),
    ('Quality Assurance'),
    ('Procurement'),
    ('Information Technology'),
    ('Research & Development'),
    ('Administration'),
    ('Business Development');

-- ============================================================
-- EMPLOYEES
-- ============================================================

-- ---------- CEO (EMP0001, no manager) ----------
INSERT INTO employees (employee_code, first_name, last_name, email, phone, department_id, manager_id, designation, date_of_joining, status)
VALUES
    ('EMP0001', 'Gaurav', 'Kadam', 'gaurav.kadam@staffdesk.com', '9800000001',
        (SELECT id FROM departments WHERE name = 'Administration'), NULL, 'Chief Executive Officer', '2019-01-01', 'ACTIVE');

-- ---------- Department heads (EMP0002-EMP0016, report to CEO) ----------
WITH head_data AS (
    SELECT * FROM (VALUES
        ('Engineering',              'Arjun',   'Menon',      'Engineering Manager'),
        ('Human Resources',          'Anjali',  'Iyer',       'HR Manager'),
        ('Sales',                    'Rahul',   'Gupta',      'Sales Manager'),
        ('Finance',                  'Yash',    'Krishnan',   'Finance Manager'),
        ('Operations',               'Deepika', 'Trivedi',    'Operations Manager'),
        ('Marketing',                'Karan',   'Bhatt',      'Marketing Manager'),
        ('Customer Support',         'Priya',   'Nair',       'Support Manager'),
        ('Legal',                    'Ravi',    'Chandra',    'Legal Manager'),
        ('Product',                  'Neha',    'Kulkarni',   'Product Manager'),
        ('Quality Assurance',        'Sanjay',  'Verma',      'QA Manager'),
        ('Procurement',              'Meera',   'Pillai',     'Procurement Manager'),
        ('Information Technology',   'Ajay',    'Bansal',     'IT Manager'),
        ('Research & Development',   'Divya',   'Rao',        'R&D Manager'),
        ('Administration',           'Rohit',   'Shah',       'Admin Manager'),
        ('Business Development',     'Snehal',  'Deshmukh',   'BD Manager')
    ) AS t(dept_name, first_name, last_name, designation)
),
head_numbered AS (
    SELECT dept_name, first_name, last_name, designation, row_number() OVER () AS rn
    FROM head_data
)
INSERT INTO employees (employee_code, first_name, last_name, email, phone, department_id, manager_id, designation, date_of_joining, status)
SELECT
    'EMP' || LPAD((1 + rn)::text, 4, '0'),
    first_name,
    last_name,
    lower(first_name || '.' || last_name || (1 + rn)::text) || '@staffdesk.com',
    '98100' || LPAD(rn::text, 5, '0'),
    (SELECT id FROM departments WHERE name = dept_name),
    (SELECT id FROM employees WHERE employee_code = 'EMP0001'),
    designation,
    (DATE '2020-02-01' + (rn * 41)::int)::date,
    'ACTIVE'
FROM head_numbered;

-- ---------- Regular staff (EMP0017-EMP0150, report to their dept head) ----------
WITH dept_order AS (
    SELECT ARRAY[
        'Engineering','Human Resources','Sales','Finance','Operations',
        'Marketing','Customer Support','Legal','Product','Quality Assurance',
        'Procurement','Information Technology','Research & Development',
        'Administration','Business Development'
    ] AS depts
),
gen AS (
    SELECT
        g,
        (ARRAY['Aarav','Vivaan','Aditya','Vihaan','Arnav','Kabir','Reyansh','Ayaan','Krishna','Ishaan',
               'Ananya','Diya','Saanvi','Aadhya','Kiara','Myra','Anika','Navya','Riya','Ira',
               'Rohan','Siddharth','Aryan','Dhruv','Nakul','Tanvi','Isha','Meera','Pallavi','Sneha']
        )[1 + ((g - 1) % 30)] AS first_name,
        (ARRAY['Sharma','Verma','Gupta','Singh','Kumar','Rao','Nair','Iyer','Menon','Pillai',
               'Reddy','Naidu','Chatterjee','Banerjee','Mukherjee','Sengupta','Bose','Ghosh','Dutta','Sarkar',
               'Kulkarni','Deshpande','Joshi','Patil','Bhosale','Shah','Mehta','Trivedi','Chauhan','Yadav']
        )[1 + ((g * 7 - 1) % 30)] AS last_name,
        (SELECT depts[1 + ((g - 1) % 15)] FROM dept_order) AS dept_name,
        (1 + ((g - 1) % 15)) AS dept_idx
    FROM generate_series(1, 134) AS g
)
INSERT INTO employees (employee_code, first_name, last_name, email, phone, department_id, manager_id, designation, date_of_joining, status)
SELECT
    'EMP' || LPAD((16 + g)::text, 4, '0'),
    first_name,
    last_name,
    lower(first_name || '.' || last_name || (16 + g)::text) || '@staffdesk.com',
    '98200' || LPAD(g::text, 5, '0'),
    (SELECT id FROM departments WHERE name = dept_name),
    (SELECT id FROM employees WHERE employee_code = 'EMP' || LPAD((1 + dept_idx)::text, 4, '0')),
    CASE dept_name
        WHEN 'Engineering'              THEN (ARRAY['Software Engineer','Senior Software Engineer','DevOps Engineer','QA Engineer'])[1 + (g % 4)]
        WHEN 'Human Resources'          THEN (ARRAY['HR Executive','HR Generalist','Talent Acquisition Specialist'])[1 + (g % 3)]
        WHEN 'Sales'                    THEN (ARRAY['Sales Executive','Account Manager','Business Development Executive'])[1 + (g % 3)]
        WHEN 'Finance'                  THEN (ARRAY['Accountant','Accounts Executive','Financial Analyst'])[1 + (g % 3)]
        WHEN 'Operations'               THEN (ARRAY['Operations Executive','Process Associate'])[1 + (g % 2)]
        WHEN 'Marketing'                THEN (ARRAY['Marketing Executive','Content Strategist','SEO Specialist'])[1 + (g % 3)]
        WHEN 'Customer Support'         THEN (ARRAY['Support Associate','Customer Success Executive'])[1 + (g % 2)]
        WHEN 'Legal'                    THEN (ARRAY['Legal Associate','Compliance Officer'])[1 + (g % 2)]
        WHEN 'Product'                  THEN (ARRAY['Product Analyst','Associate Product Manager'])[1 + (g % 2)]
        WHEN 'Quality Assurance'        THEN (ARRAY['QA Analyst','Test Engineer'])[1 + (g % 2)]
        WHEN 'Procurement'              THEN (ARRAY['Procurement Executive','Vendor Coordinator'])[1 + (g % 2)]
        WHEN 'Information Technology'   THEN (ARRAY['IT Support Engineer','Systems Administrator'])[1 + (g % 2)]
        WHEN 'Research & Development'   THEN (ARRAY['Research Analyst','R&D Engineer'])[1 + (g % 2)]
        WHEN 'Administration'           THEN (ARRAY['Admin Executive','Facilities Coordinator'])[1 + (g % 2)]
        ELSE                                 (ARRAY['Business Development Executive','Partnerships Associate'])[1 + (g % 2)]
    END,
    (DATE '2020-01-15' + ((g * 11) % 2000))::date,
    CASE WHEN g % 23 = 0 THEN 'INACTIVE' WHEN g % 41 = 0 THEN 'TERMINATED' ELSE 'ACTIVE' END
FROM gen;

-- ---------- Wire up department heads ----------
WITH heads AS (
    SELECT e.id AS emp_id, e.department_id
    FROM employees e
    WHERE substring(e.employee_code FROM 4)::int BETWEEN 2 AND 16
)
UPDATE departments d
SET head_employee_id = h.emp_id
FROM heads h
WHERE h.department_id = d.id;

-- ============================================================
-- USERS (auth accounts — CEO, all dept heads, ~80% of active staff)
-- All seeded users share the password: Staffdesk@123
-- Hash generated with real BCrypt (10 rounds), verified to work
-- with Spring Security's BCryptPasswordEncoder.
-- ============================================================
INSERT INTO users (employee_id, email, password_hash, role, is_active)
SELECT
    e.id,
    e.email,
    '$2b$10$WovkgnlEdAJEQ7BShlRSNOC8q8gU.l9yp8CU2SaAYNO..DeZ1UaSq',
    CASE
        WHEN e.employee_code = 'EMP0001' THEN 'ADMIN'
        WHEN e.designation ILIKE '%Manager%' THEN 'MANAGER'
        WHEN e.department_id = (SELECT id FROM departments WHERE name = 'Human Resources') THEN 'HR'
        ELSE 'EMPLOYEE'
    END,
    true
FROM employees e
WHERE e.status = 'ACTIVE'
  AND (
        substring(e.employee_code FROM 4)::int = 1
     OR substring(e.employee_code FROM 4)::int BETWEEN 2 AND 16
     OR (substring(e.employee_code FROM 4)::int > 16 AND substring(e.employee_code FROM 4)::int % 5 <> 0)
  );

-- ============================================================
-- ATTENDANCE (last 5 weekdays for a slice of staff, ~195 rows)
-- ============================================================
INSERT INTO attendance (employee_id, attendance_date, clock_in, clock_out, status)
SELECT
    e.id,
    d::date,
    (d::date + TIME '09:15:00') AT TIME ZONE 'Asia/Kolkata',
    (d::date + TIME '18:05:00') AT TIME ZONE 'Asia/Kolkata',
    CASE WHEN random() < 0.05 THEN 'LATE' WHEN random() < 0.03 THEN 'HALF_DAY' ELSE 'PRESENT' END
FROM employees e
CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS d
WHERE substring(e.employee_code FROM 4)::int BETWEEN 2 AND 40
  AND EXTRACT(ISODOW FROM d) < 6
  AND e.status = 'ACTIVE';

-- ============================================================
-- LEAVE REQUESTS (150 rows spanning past + future dates)
-- ============================================================
WITH params AS (
    SELECT gs, 2 + ((gs - 1) % 149) AS emp_num
    FROM generate_series(1, 150) AS gs
),
lr AS (
    SELECT
        p.gs,
        e.id AS employee_id,
        e.manager_id,
        (ARRAY['SICK','CASUAL','EARNED'])[1 + ((p.gs * 3) % 3)] AS leave_type,
        (CURRENT_DATE + ((p.gs * 13) % 150 - 90)) AS start_date,
        (1 + (p.gs % 5)) AS duration,
        (ARRAY['Fever and cold','Family function','Planned vacation','Personal work',
               'Medical checkup','Wedding in family','Relocation','Festival celebration',
               'Child care','Home renovation'])[1 + (p.gs % 10)] AS reason
    FROM params p
    JOIN employees e ON substring(e.employee_code FROM 4)::int = p.emp_num
)
INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, status, approved_by, reason)
SELECT
    employee_id,
    leave_type,
    start_date,
    start_date + (duration - 1),
    CASE
        WHEN start_date < CURRENT_DATE THEN (CASE WHEN gs % 7 = 0 THEN 'REJECTED' ELSE 'APPROVED' END)
        ELSE (CASE WHEN gs % 3 = 0 THEN 'APPROVED' ELSE 'PENDING' END)
    END,
    CASE
        WHEN start_date < CURRENT_DATE OR gs % 3 = 0 THEN manager_id
        ELSE NULL
    END,
    reason
FROM lr;

-- ============================================================
-- LEAVE BALANCES (60 employees x 3 leave types = 180 rows)
-- ============================================================
INSERT INTO leave_balances (employee_id, leave_type, year, total, used)
SELECT
    e.id,
    lt.leave_type,
    EXTRACT(YEAR FROM CURRENT_DATE)::int,
    lt.total,
    CASE WHEN random() < 0.6 THEN round((random() * lt.total / 2)::numeric, 1) ELSE 0 END
FROM employees e
CROSS JOIN (VALUES ('SICK', 12.0), ('CASUAL', 12.0), ('EARNED', 15.0)) AS lt(leave_type, total)
WHERE substring(e.employee_code FROM 4)::int BETWEEN 1 AND 60;

-- ============================================================
-- NOTIFICATIONS (160 rows)
-- ============================================================
WITH note AS (
    SELECT
        gs,
        1 + ((gs - 1) % 150) AS emp_num,
        (ARRAY['LEAVE_REQUEST_SUBMITTED','LEAVE_REQUEST_APPROVED','LEAVE_REQUEST_REJECTED','GENERAL'])[1 + (gs % 4)] AS ntype
    FROM generate_series(1, 160) AS gs
)
INSERT INTO notifications (recipient_employee_id, type, title, message, link, is_read, created_at)
SELECT
    e.id,
    n.ntype,
    CASE n.ntype
        WHEN 'LEAVE_REQUEST_SUBMITTED' THEN 'New Leave Request'
        WHEN 'LEAVE_REQUEST_APPROVED'  THEN 'Leave Request Approved'
        WHEN 'LEAVE_REQUEST_REJECTED'  THEN 'Leave Request Rejected'
        ELSE 'System Notification'
    END,
    CASE n.ntype
        WHEN 'LEAVE_REQUEST_SUBMITTED' THEN 'A new leave request has been submitted and is awaiting your approval.'
        WHEN 'LEAVE_REQUEST_APPROVED'  THEN 'Your leave request has been approved.'
        WHEN 'LEAVE_REQUEST_REJECTED'  THEN 'Your leave request has been rejected. Please contact HR for details.'
        ELSE 'Please review the latest company announcement on the portal.'
    END,
    CASE n.ntype WHEN 'GENERAL' THEN '/announcements' ELSE '/leave-requests' END,
    (n.gs % 3 = 0),
    now() - ((n.gs || ' hours')::interval)
FROM note n
JOIN employees e ON substring(e.employee_code FROM 4)::int = n.emp_num;

-- ============================================================
-- End of V4 bulk seed data
-- ============================================================