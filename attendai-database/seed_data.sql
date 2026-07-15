-- =====================================================================
-- AttendAI — demo seed data (raw SQL)
--
-- Mirrors what `python manage.py seed_demo_data` creates via Django ORM.
-- Use this if you're inspecting/standing up the schema without Django
-- (e.g. for an academic evaluation walkthrough of the raw database).
--
-- NOTE: `users.password` values below are placeholders, not real Django
-- password hashes — if you insert this data directly (bypassing Django),
-- reset passwords via `python manage.py changepassword <username>`
-- afterwards, or use the Django `seed_demo_data` command instead, which
-- sets real hashed passwords for you.
-- =====================================================================

-- Departments
INSERT INTO departments (id, name, code) VALUES
    ('11111111-1111-1111-1111-111111111101', 'Computer Science & Engineering', 'CSE'),
    ('11111111-1111-1111-1111-111111111102', 'Artificial Intelligence & ML', 'AIML');

-- Courses
INSERT INTO courses (id, department_id, name, code, duration_years) VALUES
    ('11111111-1111-1111-1111-111111111201', '11111111-1111-1111-1111-111111111101', 'B.Tech Computer Science', 'BT-CSE', 4),
    ('11111111-1111-1111-1111-111111111202', '11111111-1111-1111-1111-111111111102', 'B.Tech AI & ML', 'BT-AIML', 4);

-- Subjects
INSERT INTO subjects (id, course_id, name, code, semester, credits) VALUES
    ('11111111-1111-1111-1111-111111111301', '11111111-1111-1111-1111-111111111201', 'Data Structures', 'CS301', 3, 4),
    ('11111111-1111-1111-1111-111111111302', '11111111-1111-1111-1111-111111111201', 'Database Management', 'CS302', 3, 4),
    ('11111111-1111-1111-1111-111111111303', '11111111-1111-1111-1111-111111111201', 'Operating Systems', 'CS401', 4, 4),
    ('11111111-1111-1111-1111-111111111304', '11111111-1111-1111-1111-111111111202', 'Machine Learning', 'AI301', 3, 4);

-- Sections
INSERT INTO sections (id, course_id, name, semester) VALUES
    ('11111111-1111-1111-1111-111111111401', '11111111-1111-1111-1111-111111111201', 'A', 3),
    ('11111111-1111-1111-1111-111111111402', '11111111-1111-1111-1111-111111111201', 'B', 3);

-- Classrooms
INSERT INTO classrooms (id, name, building, capacity) VALUES
    ('11111111-1111-1111-1111-111111111501', 'Room 204', 'Block A', 65),
    ('11111111-1111-1111-1111-111111111502', 'Room 118', 'Block A', 60),
    ('11111111-1111-1111-1111-111111111503', 'Room 302', 'Block B', 70);

-- Users (admin, one faculty, four students) — replace `password` with a
-- real Django-hashed value before using these accounts to log in.
INSERT INTO users (id, username, email, password, first_name, last_name, role) VALUES
    ('22222222-2222-2222-2222-222222222201', 'admin', 'admin@attendai.edu', '!', 'System', 'Admin', 'admin'),
    ('22222222-2222-2222-2222-222222222202', 'FAC-1042', 'kavita.nair@attendai.edu', '!', 'Kavita', 'Nair', 'faculty'),
    ('22222222-2222-2222-2222-222222222301', 'CS21B045', 'aarav.sharma@attendai.edu', '!', 'Aarav', 'Sharma', 'student'),
    ('22222222-2222-2222-2222-222222222302', 'CS21B012', 'diya.patel@attendai.edu', '!', 'Diya', 'Patel', 'student'),
    ('22222222-2222-2222-2222-222222222303', 'CS21B078', 'rohan.mehta@attendai.edu', '!', 'Rohan', 'Mehta', 'student'),
    ('22222222-2222-2222-2222-222222222304', 'CS21B033', 'sneha.iyer@attendai.edu', '!', 'Sneha', 'Iyer', 'student');

-- Faculty profile
INSERT INTO faculty (id, user_id, employee_id, department_id) VALUES
    ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222202', 'FAC-1042', '11111111-1111-1111-1111-111111111101');

INSERT INTO faculty_subjects (faculty_id, subject_id) VALUES
    ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111301'),
    ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111302');

INSERT INTO faculty_classrooms (faculty_id, classroom_id) VALUES
    ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111501'),
    ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111502');

-- Student profiles
INSERT INTO students (id, user_id, roll_no, course_id, section_id, admission_year) VALUES
    ('44444444-4444-4444-4444-444444444401', '22222222-2222-2222-2222-222222222301', 'CS21B045', '11111111-1111-1111-1111-111111111201', '11111111-1111-1111-1111-111111111401', 2021),
    ('44444444-4444-4444-4444-444444444402', '22222222-2222-2222-2222-222222222302', 'CS21B012', '11111111-1111-1111-1111-111111111201', '11111111-1111-1111-1111-111111111401', 2021),
    ('44444444-4444-4444-4444-444444444403', '22222222-2222-2222-2222-222222222303', 'CS21B078', '11111111-1111-1111-1111-111111111201', '11111111-1111-1111-1111-111111111402', 2021),
    ('44444444-4444-4444-4444-444444444404', '22222222-2222-2222-2222-222222222304', 'CS21B033', '11111111-1111-1111-1111-111111111201', '11111111-1111-1111-1111-111111111402', 2021);

-- Default AI settings row (singleton)
INSERT INTO ai_settings (id, confidence_threshold, max_head_rotation_degrees, anti_spoofing_enabled, quality_check_enabled)
VALUES (1, 94, 20, TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;
