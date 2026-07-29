-- ============================================================
-- Employee Management System — Phase 1 Seed Data
-- Populates: departments, employees, users, attendance, leave
-- ~60 employee records with Indian-origin names
-- ============================================================

-- ---------- DEPARTMENTS (head_employee_id set later) ----------
INSERT INTO departments (name) VALUES
    ('Engineering'),
    ('Human Resources'),
    ('Sales'),
    ('Finance'),
    ('Operations');

-- ---------- EMPLOYEES: Admin & Department Managers (manager_id NULL) ----------
INSERT INTO employees (employee_code, first_name, last_name, email, phone, department_id, manager_id, designation, date_of_joining, status)
VALUES
    ('EMP001', 'Gaurav', 'Kadam', 'gauravkadam@staffdesk.com', '9800000000',
        (SELECT id FROM departments WHERE name = 'Operations'), NULL, 'System Administrator', '2020-01-01', 'ACTIVE'),
    ('EMP002', 'Arjun', 'Menon', 'arjun.menon@staffdesk.com', '9800000002',
        (SELECT id FROM departments WHERE name = 'Engineering'), NULL, 'Engineering Manager', '2021-06-28', 'ACTIVE'),
    ('EMP003', 'Anjali', 'Iyer', 'anjali.iyer@staffdesk.com', '9800000003',
        (SELECT id FROM departments WHERE name = 'Human Resources'), NULL, 'HR Manager', '2021-06-20', 'ACTIVE'),
    ('EMP004', 'Rahul', 'Gupta', 'rahul.gupta@staffdesk.com', '9800000004',
        (SELECT id FROM departments WHERE name = 'Sales'), NULL, 'Sales Manager', '2021-05-26', 'ACTIVE'),
    ('EMP005', 'Yash', 'Krishnan', 'yash.krishnan@staffdesk.com', '9800000005',
        (SELECT id FROM departments WHERE name = 'Finance'), NULL, 'Finance Manager', '2021-01-24', 'ACTIVE'),
    ('EMP006', 'Deepika', 'Trivedi', 'deepika.trivedi@staffdesk.com', '9800000006',
        (SELECT id FROM departments WHERE name = 'Operations'), NULL, 'Operations Manager', '2021-08-18', 'ACTIVE');

-- ---------- EMPLOYEES: Reports (assigned to their department manager) ----------
INSERT INTO employees (employee_code, first_name, last_name, email, phone, department_id, manager_id, designation, date_of_joining, status)
VALUES
    ('EMP007', 'Manish', 'Kapoor', 'manish.kapoor@staffdesk.com', '9810001007',
        (SELECT id FROM departments WHERE name = 'Engineering'),
        (SELECT id FROM employees WHERE employee_code = 'EMP002'), 'Software Engineer', '2024-02-18', 'ACTIVE'),
    ('EMP008', 'Abhishek', 'Yadav', 'abhishek.yadav@staffdesk.com', '9810001008',
        (SELECT id FROM departments WHERE name = 'Human Resources'),
        (SELECT id FROM employees WHERE employee_code = 'EMP003'), 'HR Generalist', '2023-10-07', 'ACTIVE'),
    ('EMP009', 'Pooja', 'Joshi', 'pooja.joshi@staffdesk.com', '9810001009',
        (SELECT id FROM departments WHERE name = 'Sales'),
        (SELECT id FROM employees WHERE employee_code = 'EMP004'), 'Account Manager', '2021-01-22', 'ACTIVE'),
    ('EMP010', 'Vikram', 'Reddy', 'vikram.reddy@staffdesk.com', '9810001010',
        (SELECT id FROM departments WHERE name = 'Finance'),
        (SELECT id FROM employees WHERE employee_code = 'EMP005'), 'Accountant', '2023-02-28', 'ACTIVE'),
    ('EMP011', 'Gaurav', 'Saxena', 'gaurav.saxena@staffdesk.com', '9810001011',
        (SELECT id FROM departments WHERE name = 'Operations'),
        (SELECT id FROM employees WHERE employee_code = 'EMP006'), 'Operations Executive', '2021-07-09', 'ACTIVE'),
    ('EMP012', 'Riya', 'Mukherjee', 'riya.mukherjee@staffdesk.com', '9810001012',
        (SELECT id FROM departments WHERE name = 'Engineering'),
        (SELECT id FROM employees WHERE employee_code = 'EMP002'), 'DevOps Engineer', '2023-03-12', 'ACTIVE'),
    ('EMP013', 'Vivek', 'Rana', 'vivek.rana@staffdesk.com', '9810001013',
        (SELECT id FROM departments WHERE name = 'Human Resources'),
        (SELECT id FROM employees WHERE employee_code = 'EMP003'), 'HR Generalist', '2022-11-09', 'ACTIVE'),
    ('EMP014', 'Swati', 'Mishra', 'swati.mishra@staffdesk.com', '9810001014',
        (SELECT id FROM departments WHERE name = 'Sales'),
        (SELECT id FROM employees WHERE employee_code = 'EMP004'), 'Account Manager', '2021-10-21', 'ACTIVE'),
    ('EMP015', 'Varun', 'Malhotra', 'varun.malhotra@staffdesk.com', '9810001015',
        (SELECT id FROM departments WHERE name = 'Finance'),
        (SELECT id FROM employees WHERE employee_code = 'EMP005'), 'Accountant', '2022-03-15', 'ACTIVE'),
    ('EMP016', 'Amit', 'Patel', 'amit.patel@staffdesk.com', '9810001016',
        (SELECT id FROM departments WHERE name = 'Operations'),
        (SELECT id FROM employees WHERE employee_code = 'EMP006'), 'Process Associate', '2023-11-23', 'ACTIVE'),
    ('EMP017', 'Harsh', 'Das', 'harsh.das@staffdesk.com', '9810001017',
        (SELECT id FROM departments WHERE name = 'Engineering'),
        (SELECT id FROM employees WHERE employee_code = 'EMP002'), 'Senior Software Engineer', '2023-01-08', 'ACTIVE'),
    ('EMP018', 'Radhika', 'Dutta', 'radhika.dutta@staffdesk.com', '9810001018',
        (SELECT id FROM departments WHERE name = 'Human Resources'),
        (SELECT id FROM employees WHERE employee_code = 'EMP003'), 'HR Executive', '2023-07-09', 'ACTIVE'),
    ('EMP019', 'Suresh', 'Sinha', 'suresh.sinha@staffdesk.com', '9810001019',
        (SELECT id FROM departments WHERE name = 'Sales'),
        (SELECT id FROM employees WHERE employee_code = 'EMP004'), 'Sales Executive', '2022-10-23', 'ACTIVE'),
    ('EMP020', 'Kavya', 'Kumar', 'kavya.kumar@staffdesk.com', '9810001020',
        (SELECT id FROM departments WHERE name = 'Finance'),
        (SELECT id FROM employees WHERE employee_code = 'EMP005'), 'Financial Analyst', '2022-11-16', 'ACTIVE'),
    ('EMP021', 'Rajesh', 'Pandey', 'rajesh.pandey@staffdesk.com', '9810001021',
        (SELECT id FROM departments WHERE name = 'Operations'),
        (SELECT id FROM employees WHERE employee_code = 'EMP006'), 'Process Associate', '2024-03-09', 'ACTIVE'),
    ('EMP022', 'Aarav', 'Chatterjee', 'aarav.chatterjee@staffdesk.com', '9810001022',
        (SELECT id FROM departments WHERE name = 'Engineering'),
        (SELECT id FROM employees WHERE employee_code = 'EMP002'), 'Senior Software Engineer', '2022-12-18', 'ACTIVE'),
    ('EMP023', 'Shreya', 'Tiwari', 'shreya.tiwari@staffdesk.com', '9810001023',
        (SELECT id FROM departments WHERE name = 'Human Resources'),
        (SELECT id FROM employees WHERE employee_code = 'EMP003'), 'Talent Acquisition Specialist', '2023-12-19', 'ACTIVE'),
    ('EMP024', 'Simran', 'Subramaniam', 'simran.subramaniam@staffdesk.com', '9810001024',
        (SELECT id FROM departments WHERE name = 'Sales'),
        (SELECT id FROM employees WHERE employee_code = 'EMP004'), 'Business Development Executive', '2024-06-08', 'ACTIVE'),
    ('EMP025', 'Nandini', 'Chauhan', 'nandini.chauhan@staffdesk.com', '9810001025',
        (SELECT id FROM departments WHERE name = 'Finance'),
        (SELECT id FROM employees WHERE employee_code = 'EMP005'), 'Accountant', '2024-02-25', 'ACTIVE'),
    ('EMP026', 'Ishita', 'Bose', 'ishita.bose@staffdesk.com', '9810001026',
        (SELECT id FROM departments WHERE name = 'Operations'),
        (SELECT id FROM employees WHERE employee_code = 'EMP006'), 'Operations Executive', '2021-03-21', 'ACTIVE'),
    ('EMP027', 'Nikhil', 'Bhat', 'nikhil.bhat@staffdesk.com', '9810001027',
        (SELECT id FROM departments WHERE name = 'Engineering'),
        (SELECT id FROM employees WHERE employee_code = 'EMP002'), 'Senior Software Engineer', '2024-10-03', 'ACTIVE'),
    ('EMP028', 'Anushka', 'Shetty', 'anushka.shetty@staffdesk.com', '9810001028',
        (SELECT id FROM departments WHERE name = 'Human Resources'),
        (SELECT id FROM employees WHERE employee_code = 'EMP003'), 'HR Generalist', '2024-10-15', 'ACTIVE'),
    ('EMP029', 'Tanvi', 'Ghosh', 'tanvi.ghosh@staffdesk.com', '9810001029',
        (SELECT id FROM departments WHERE name = 'Sales'),
        (SELECT id FROM employees WHERE employee_code = 'EMP004'), 'Account Manager', '2023-09-28', 'ACTIVE'),
    ('EMP030', 'Rohan', 'Deshmukh', 'rohan.deshmukh@staffdesk.com', '9810001030',
        (SELECT id FROM departments WHERE name = 'Finance'),
        (SELECT id FROM employees WHERE employee_code = 'EMP005'), 'Accountant', '2021-11-18', 'ACTIVE'),
    ('EMP031', 'Aditya', 'Sharma', 'aditya.sharma@staffdesk.com', '9810001031',
        (SELECT id FROM departments WHERE name = 'Operations'),
        (SELECT id FROM employees WHERE employee_code = 'EMP006'), 'Process Associate', '2023-02-10', 'ACTIVE'),
    ('EMP032', 'Kunal', 'Pai', 'kunal.pai@staffdesk.com', '9810001032',
        (SELECT id FROM departments WHERE name = 'Engineering'),
        (SELECT id FROM employees WHERE employee_code = 'EMP002'), 'DevOps Engineer', '2022-08-01', 'ACTIVE'),
    ('EMP033', 'Kritika', 'Bhatt', 'kritika.bhatt@staffdesk.com', '9810001033',
        (SELECT id FROM departments WHERE name = 'Human Resources'),
        (SELECT id FROM employees WHERE employee_code = 'EMP003'), 'Talent Acquisition Specialist', '2023-09-25', 'ACTIVE'),
    ('EMP034', 'Karan', 'Verma', 'karan.verma@staffdesk.com', '9810001034',
        (SELECT id FROM departments WHERE name = 'Sales'),
        (SELECT id FROM employees WHERE employee_code = 'EMP004'), 'Sales Executive', '2021-11-10', 'ACTIVE'),
    ('EMP035', 'Neha', 'Kulkarni', 'neha.kulkarni@staffdesk.com', '9810001035',
        (SELECT id FROM departments WHERE name = 'Finance'),
        (SELECT id FROM employees WHERE employee_code = 'EMP005'), 'Accounts Executive', '2022-03-12', 'ACTIVE'),
    ('EMP036', 'Ananya', 'Rao', 'ananya.rao@staffdesk.com', '9810001036',
        (SELECT id FROM departments WHERE name = 'Operations'),
        (SELECT id FROM employees WHERE employee_code = 'EMP006'), 'Operations Executive', '2021-10-11', 'ACTIVE'),
    ('EMP037', 'Siddharth', 'Singh', 'siddharth.singh@staffdesk.com', '9810001037',
        (SELECT id FROM departments WHERE name = 'Engineering'),
        (SELECT id FROM employees WHERE employee_code = 'EMP002'), 'DevOps Engineer', '2021-02-12', 'ACTIVE'),
    ('EMP038', 'Divya', 'Chopra', 'divya.chopra@staffdesk.com', '9810001038',
        (SELECT id FROM departments WHERE name = 'Human Resources'),
        (SELECT id FROM employees WHERE employee_code = 'EMP003'), 'HR Generalist', '2022-01-08', 'ACTIVE'),
    ('EMP039', 'Meera', 'Agarwal', 'meera.agarwal@staffdesk.com', '9810001039',
        (SELECT id FROM departments WHERE name = 'Sales'),
        (SELECT id FROM employees WHERE employee_code = 'EMP004'), 'Account Manager', '2021-02-24', 'ACTIVE'),
    ('EMP040', 'Priya', 'Nair', 'priya.nair@staffdesk.com', '9810001040',
        (SELECT id FROM departments WHERE name = 'Finance'),
        (SELECT id FROM employees WHERE employee_code = 'EMP005'), 'Financial Analyst', '2021-09-25', 'ACTIVE'),
    ('EMP041', 'Sneha', 'Pillai', 'sneha.pillai@staffdesk.com', '9810001041',
        (SELECT id FROM departments WHERE name = 'Operations'),
        (SELECT id FROM employees WHERE employee_code = 'EMP006'), 'Operations Executive', '2022-11-16', 'ACTIVE'),
    ('EMP042', 'Radhika', 'Gupta', 'radhika.gupta@staffdesk.com', '9810001042',
        (SELECT id FROM departments WHERE name = 'Engineering'),
        (SELECT id FROM employees WHERE employee_code = 'EMP002'), 'QA Engineer', '2024-04-18', 'ACTIVE'),
    ('EMP043', 'Rajat', 'Patel', 'rajat.patel@staffdesk.com', '9810001043',
        (SELECT id FROM departments WHERE name = 'Human Resources'),
        (SELECT id FROM employees WHERE employee_code = 'EMP003'), 'Talent Acquisition Specialist', '2023-07-22', 'ACTIVE'),
    ('EMP044', 'Preeti', 'Mishra', 'preeti.mishra@staffdesk.com', '9810001044',
        (SELECT id FROM departments WHERE name = 'Sales'),
        (SELECT id FROM employees WHERE employee_code = 'EMP004'), 'Business Development Executive', '2024-02-08', 'ACTIVE'),
    ('EMP045', 'Siddharth', 'Reddy', 'siddharth.reddy@staffdesk.com', '9810001045',
        (SELECT id FROM departments WHERE name = 'Finance'),
        (SELECT id FROM employees WHERE employee_code = 'EMP005'), 'Financial Analyst', '2021-10-18', 'ACTIVE'),
    ('EMP046', 'Siddharth', 'Subramaniam', 'siddharth.subramaniam@staffdesk.com', '9810001046',
        (SELECT id FROM departments WHERE name = 'Operations'),
        (SELECT id FROM employees WHERE employee_code = 'EMP006'), 'Operations Executive', '2021-02-23', 'ACTIVE'),
    ('EMP047', 'Ravi', 'Iyer', 'ravi.iyer@staffdesk.com', '9810001047',
        (SELECT id FROM departments WHERE name = 'Engineering'),
        (SELECT id FROM employees WHERE employee_code = 'EMP002'), 'Senior Software Engineer', '2021-01-28', 'ACTIVE'),
    ('EMP048', 'Riya', 'Reddy', 'riya.reddy@staffdesk.com', '9810001048',
        (SELECT id FROM departments WHERE name = 'Human Resources'),
        (SELECT id FROM employees WHERE employee_code = 'EMP003'), 'Talent Acquisition Specialist', '2022-05-22', 'ACTIVE'),
    ('EMP049', 'Shreya', 'Kumar', 'shreya.kumar@staffdesk.com', '9810001049',
        (SELECT id FROM departments WHERE name = 'Sales'),
        (SELECT id FROM employees WHERE employee_code = 'EMP004'), 'Account Manager', '2022-12-19', 'ACTIVE'),
    ('EMP050', 'Yash', 'Yadav', 'yash.yadav@staffdesk.com', '9810001050',
        (SELECT id FROM departments WHERE name = 'Finance'),
        (SELECT id FROM employees WHERE employee_code = 'EMP005'), 'Accountant', '2024-07-07', 'ACTIVE'),
    ('EMP051', 'Neha', 'Kulkarni', 'neha.kulkarni2@staffdesk.com', '9810001051',
        (SELECT id FROM departments WHERE name = 'Operations'),
        (SELECT id FROM employees WHERE employee_code = 'EMP006'), 'Operations Analyst', '2024-06-14', 'ACTIVE'),
    ('EMP052', 'Suresh', 'Chauhan', 'suresh.chauhan@staffdesk.com', '9810001052',
        (SELECT id FROM departments WHERE name = 'Engineering'),
        (SELECT id FROM employees WHERE employee_code = 'EMP002'), 'Software Engineer', '2021-01-13', 'ACTIVE'),
    ('EMP053', 'Naveen', 'Mukherjee', 'naveen.mukherjee@staffdesk.com', '9810001053',
        (SELECT id FROM departments WHERE name = 'Human Resources'),
        (SELECT id FROM employees WHERE employee_code = 'EMP003'), 'HR Executive', '2022-04-07', 'ACTIVE'),
    ('EMP054', 'Harsh', 'Rana', 'harsh.rana@staffdesk.com', '9810001054',
        (SELECT id FROM departments WHERE name = 'Sales'),
        (SELECT id FROM employees WHERE employee_code = 'EMP004'), 'Sales Executive', '2024-03-09', 'ACTIVE'),
    ('EMP055', 'Nandini', 'Chopra', 'nandini.chopra@staffdesk.com', '9810001055',
        (SELECT id FROM departments WHERE name = 'Finance'),
        (SELECT id FROM employees WHERE employee_code = 'EMP005'), 'Accountant', '2024-09-04', 'ACTIVE'),
    ('EMP056', 'Anjali', 'Das', 'anjali.das@staffdesk.com', '9810001056',
        (SELECT id FROM departments WHERE name = 'Operations'),
        (SELECT id FROM employees WHERE employee_code = 'EMP006'), 'Operations Executive', '2021-04-06', 'ACTIVE'),
    ('EMP057', 'Suresh', 'Tiwari', 'suresh.tiwari@staffdesk.com', '9810001057',
        (SELECT id FROM departments WHERE name = 'Engineering'),
        (SELECT id FROM employees WHERE employee_code = 'EMP002'), 'DevOps Engineer', '2022-07-02', 'ACTIVE'),
    ('EMP058', 'Rahul', 'Kapoor', 'rahul.kapoor@staffdesk.com', '9810001058',
        (SELECT id FROM departments WHERE name = 'Human Resources'),
        (SELECT id FROM employees WHERE employee_code = 'EMP003'), 'HR Executive', '2024-05-26', 'ACTIVE'),
    ('EMP059', 'Mohit', 'Chauhan', 'mohit.chauhan@staffdesk.com', '9810001059',
        (SELECT id FROM departments WHERE name = 'Sales'),
        (SELECT id FROM employees WHERE employee_code = 'EMP004'), 'Business Development Executive', '2024-12-24', 'ACTIVE'),
    ('EMP060', 'Mohit', 'Dutta', 'mohit.dutta@staffdesk.com', '9810001060',
        (SELECT id FROM departments WHERE name = 'Finance'),
        (SELECT id FROM employees WHERE employee_code = 'EMP005'), 'Accounts Executive', '2024-03-07', 'ACTIVE');

-- ---------- WIRE UP DEPARTMENT HEADS ----------
UPDATE departments SET head_employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP002') WHERE name = 'Engineering';
UPDATE departments SET head_employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP003') WHERE name = 'Human Resources';
UPDATE departments SET head_employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP004') WHERE name = 'Sales';
UPDATE departments SET head_employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP005') WHERE name = 'Finance';
UPDATE departments SET head_employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP006') WHERE name = 'Operations';

-- ---------- USERS (auth accounts) ----------
-- Admin password: Gaurav@Staffdesk1
-- All other seeded users share the password: Staffdesk@123
-- Hashes generated with real BCrypt (10 rounds) — verified to work with Spring Security's BCryptPasswordEncoder
INSERT INTO users (employee_id, email, password_hash, role, is_active)
VALUES
    ((SELECT id FROM employees WHERE employee_code = 'EMP001'), 'gauravkadam@staffdesk.com', '$2b$10$u2IvVgIVeWvhB0izkFEL1OK3g9dS6hqnvPkj2dDXDrX6SqWpElSDu', 'ADMIN', true),
    ((SELECT id FROM employees WHERE employee_code = 'EMP002'), 'arjun.menon@staffdesk.com', '$2b$10$WovkgnlEdAJEQ7BShlRSNOC8q8gU.l9yp8CU2SaAYNO..DeZ1UaSq', 'MANAGER', true),
    ((SELECT id FROM employees WHERE employee_code = 'EMP003'), 'anjali.iyer@staffdesk.com', '$2b$10$WovkgnlEdAJEQ7BShlRSNOC8q8gU.l9yp8CU2SaAYNO..DeZ1UaSq', 'HR', true),
    ((SELECT id FROM employees WHERE employee_code = 'EMP004'), 'rahul.gupta@staffdesk.com', '$2b$10$WovkgnlEdAJEQ7BShlRSNOC8q8gU.l9yp8CU2SaAYNO..DeZ1UaSq', 'MANAGER', true),
    ((SELECT id FROM employees WHERE employee_code = 'EMP005'), 'yash.krishnan@staffdesk.com', '$2b$10$WovkgnlEdAJEQ7BShlRSNOC8q8gU.l9yp8CU2SaAYNO..DeZ1UaSq', 'MANAGER', true),
    ((SELECT id FROM employees WHERE employee_code = 'EMP006'), 'deepika.trivedi@staffdesk.com', '$2b$10$WovkgnlEdAJEQ7BShlRSNOC8q8gU.l9yp8CU2SaAYNO..DeZ1UaSq', 'MANAGER', true),
    ((SELECT id FROM employees WHERE employee_code = 'EMP007'), 'manish.kapoor@staffdesk.com', '$2b$10$WovkgnlEdAJEQ7BShlRSNOC8q8gU.l9yp8CU2SaAYNO..DeZ1UaSq', 'EMPLOYEE', true),
    ((SELECT id FROM employees WHERE employee_code = 'EMP008'), 'abhishek.yadav@staffdesk.com', '$2b$10$WovkgnlEdAJEQ7BShlRSNOC8q8gU.l9yp8CU2SaAYNO..DeZ1UaSq', 'EMPLOYEE', true),
    ((SELECT id FROM employees WHERE employee_code = 'EMP009'), 'pooja.joshi@staffdesk.com', '$2b$10$WovkgnlEdAJEQ7BShlRSNOC8q8gU.l9yp8CU2SaAYNO..DeZ1UaSq', 'EMPLOYEE', true),
    ((SELECT id FROM employees WHERE employee_code = 'EMP010'), 'vikram.reddy@staffdesk.com', '$2b$10$WovkgnlEdAJEQ7BShlRSNOC8q8gU.l9yp8CU2SaAYNO..DeZ1UaSq', 'EMPLOYEE', true),
    ((SELECT id FROM employees WHERE employee_code = 'EMP011'), 'gaurav.saxena@staffdesk.com', '$2b$10$WovkgnlEdAJEQ7BShlRSNOC8q8gU.l9yp8CU2SaAYNO..DeZ1UaSq', 'EMPLOYEE', true),
    ((SELECT id FROM employees WHERE employee_code = 'EMP012'), 'riya.mukherjee@staffdesk.com', '$2b$10$WovkgnlEdAJEQ7BShlRSNOC8q8gU.l9yp8CU2SaAYNO..DeZ1UaSq', 'EMPLOYEE', true),
    ((SELECT id FROM employees WHERE employee_code = 'EMP013'), 'vivek.rana@staffdesk.com', '$2b$10$WovkgnlEdAJEQ7BShlRSNOC8q8gU.l9yp8CU2SaAYNO..DeZ1UaSq', 'EMPLOYEE', true),
    ((SELECT id FROM employees WHERE employee_code = 'EMP014'), 'swati.mishra@staffdesk.com', '$2b$10$WovkgnlEdAJEQ7BShlRSNOC8q8gU.l9yp8CU2SaAYNO..DeZ1UaSq', 'EMPLOYEE', true),
    ((SELECT id FROM employees WHERE employee_code = 'EMP015'), 'varun.malhotra@staffdesk.com', '$2b$10$WovkgnlEdAJEQ7BShlRSNOC8q8gU.l9yp8CU2SaAYNO..DeZ1UaSq', 'EMPLOYEE', true),
    ((SELECT id FROM employees WHERE employee_code = 'EMP016'), 'amit.patel@staffdesk.com', '$2b$10$WovkgnlEdAJEQ7BShlRSNOC8q8gU.l9yp8CU2SaAYNO..DeZ1UaSq', 'EMPLOYEE', true);

-- ---------- ATTENDANCE (last 5 weekdays for employees with login accounts) ----------
INSERT INTO attendance (employee_id, attendance_date, clock_in, clock_out, status)
SELECT
    e.id,
    d::date,
    (d::date + TIME '09:15:00') AT TIME ZONE 'Asia/Kolkata',
    (d::date + TIME '18:05:00') AT TIME ZONE 'Asia/Kolkata',
    'PRESENT'
FROM employees e
CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE, INTERVAL '1 day') AS d
WHERE e.employee_code IN ('EMP007', 'EMP008', 'EMP009', 'EMP010', 'EMP011', 'EMP012', 'EMP013', 'EMP014', 'EMP015', 'EMP016')
  AND EXTRACT(ISODOW FROM d) < 6;  -- weekdays only

-- ---------- LEAVE REQUESTS ----------
INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, status, approved_by, reason)
VALUES
    ((SELECT id FROM employees WHERE employee_code = 'EMP007'), 'SICK',   CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '9 days',
        'APPROVED', (SELECT id FROM employees WHERE employee_code = 'EMP002'), 'Fever and cold'),
    ((SELECT id FROM employees WHERE employee_code = 'EMP008'), 'CASUAL', CURRENT_DATE + INTERVAL '5 days',  CURRENT_DATE + INTERVAL '5 days',
        'PENDING',  NULL, 'Family function'),
    ((SELECT id FROM employees WHERE employee_code = 'EMP009'), 'EARNED', CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '24 days',
        'PENDING',  NULL, 'Planned vacation');

-- ---------- LEAVE BALANCES (current year, all employees) ----------
INSERT INTO leave_balances (employee_id, leave_type, year, total, used)
SELECT e.id, lt.leave_type, EXTRACT(YEAR FROM CURRENT_DATE)::int, lt.total, 0
FROM employees e
CROSS JOIN (VALUES ('SICK', 12.0), ('CASUAL', 12.0), ('EARNED', 15.0)) AS lt(leave_type, total);

-- Reflect the approved/used leave for EMP007 (2 days SICK)
UPDATE leave_balances
SET used = 2.0
WHERE employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP007')
  AND leave_type = 'SICK'
  AND year = EXTRACT(YEAR FROM CURRENT_DATE)::int;

-- ============================================================
-- End of seed data
-- ============================================================