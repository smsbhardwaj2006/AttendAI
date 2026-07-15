-- =====================================================================
-- AttendAI — PostgreSQL schema (reference DDL)
--
-- This mirrors the Django models in attendai-backend/apps/*/models.py.
-- The Django app is the source of truth (via `python manage.py migrate`);
-- this file exists so the schema can be reviewed, diagrammed, or stood up
-- independently of Django for documentation/academic-evaluation purposes.
--
-- Run against an empty database:
--   psql -U attendai_user -d attendai -f schema.sql
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- Users & auth
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username            VARCHAR(150) UNIQUE NOT NULL,
    email               VARCHAR(254) UNIQUE NOT NULL,
    password            VARCHAR(128) NOT NULL,          -- Django's hashed password
    first_name          VARCHAR(150) NOT NULL DEFAULT '',
    last_name           VARCHAR(150) NOT NULL DEFAULT '',
    role                VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'faculty', 'student')),
    phone_number        VARCHAR(20) NOT NULL DEFAULT '',
    is_active_profile   BOOLEAN NOT NULL DEFAULT TRUE,
    is_staff            BOOLEAN NOT NULL DEFAULT FALSE,
    is_superuser        BOOLEAN NOT NULL DEFAULT FALSE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    last_login          TIMESTAMPTZ,
    date_joined         TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_role ON users(role);

-- ---------------------------------------------------------------------
-- Academic structure
-- ---------------------------------------------------------------------
CREATE TABLE departments (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(150) UNIQUE NOT NULL,
    code        VARCHAR(10) UNIQUE NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE courses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id   UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    name            VARCHAR(150) NOT NULL,
    code            VARCHAR(20) NOT NULL,
    duration_years  SMALLINT NOT NULL DEFAULT 4,
    UNIQUE (department_id, code)
);

CREATE TABLE subjects (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name        VARCHAR(150) NOT NULL,
    code        VARCHAR(20) NOT NULL,
    semester    SMALLINT NOT NULL,
    credits     SMALLINT NOT NULL DEFAULT 3,
    UNIQUE (course_id, code)
);

CREATE TABLE sections (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name        VARCHAR(10) NOT NULL,
    semester    SMALLINT NOT NULL,
    UNIQUE (course_id, name, semester)
);

CREATE TABLE classrooms (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(50) UNIQUE NOT NULL,
    building    VARCHAR(100) NOT NULL DEFAULT '',
    capacity    SMALLINT NOT NULL DEFAULT 60,
    camera_id   VARCHAR(100) NOT NULL DEFAULT ''
);

-- ---------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------
CREATE TABLE students (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    roll_no                 VARCHAR(20) UNIQUE NOT NULL,
    course_id               UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    section_id              UUID NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
    admission_year          SMALLINT NOT NULL,
    date_of_birth           DATE,
    face_enrollment_status  VARCHAR(15) NOT NULL DEFAULT 'not_enrolled'
                            CHECK (face_enrollment_status IN ('not_enrolled','pending','enrolled','rejected')),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_students_section ON students(section_id);
CREATE INDEX idx_students_course ON students(course_id);

CREATE TABLE faculty (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id     VARCHAR(20) UNIQUE NOT NULL,
    department_id   UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE faculty_subjects (          -- M2M: faculty <-> subjects
    faculty_id  UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    PRIMARY KEY (faculty_id, subject_id)
);

CREATE TABLE faculty_classrooms (        -- M2M: faculty <-> classrooms
    faculty_id      UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    classroom_id    UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    PRIMARY KEY (faculty_id, classroom_id)
);

-- ---------------------------------------------------------------------
-- Face recognition data
-- ---------------------------------------------------------------------
-- `vector` uses JSONB for portability. If the pgvector extension is
-- available, prefer:  vector VECTOR(512)  and add an IVFFlat/HNSW index
-- for fast approximate nearest-neighbour search at institution scale.
CREATE TABLE face_embeddings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    vector          JSONB NOT NULL,
    sample_image    VARCHAR(255) NOT NULL,   -- storage path, e.g. media/face_samples/2026/07/xyz.jpg
    quality_score   REAL NOT NULL DEFAULT 0,
    pose_label      VARCHAR(30) NOT NULL DEFAULT '',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_face_embeddings_student ON face_embeddings(student_id) WHERE is_active;

-- ---------------------------------------------------------------------
-- Attendance
-- ---------------------------------------------------------------------
CREATE TABLE attendance_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id      UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
    section_id      UUID NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
    classroom_id    UUID NOT NULL REFERENCES classrooms(id) ON DELETE RESTRICT,
    faculty_id      UUID NOT NULL REFERENCES faculty(id) ON DELETE RESTRICT,
    status          VARCHAR(10) NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled','active','completed')),
    started_at      TIMESTAMPTZ,
    ended_at        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sessions_faculty ON attendance_sessions(faculty_id);
CREATE INDEX idx_sessions_started_at ON attendance_sessions(started_at);

CREATE TABLE attendance_records (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id          UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id          UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status              VARCHAR(15) NOT NULL DEFAULT 'absent'
                        CHECK (status IN ('present','late','absent','spoof_detected')),
    confidence          REAL,
    method              VARCHAR(10) NOT NULL DEFAULT 'auto' CHECK (method IN ('auto','manual')),
    marked_at           TIMESTAMPTZ,
    marked_by_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    needs_verification  BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (session_id, student_id)
);
CREATE INDEX idx_records_student ON attendance_records(student_id);
CREATE INDEX idx_records_session ON attendance_records(session_id);
CREATE INDEX idx_records_status ON attendance_records(status);

CREATE TABLE unknown_face_logs (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id              UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    classroom_id            UUID REFERENCES classrooms(id) ON DELETE SET NULL,
    reason                  VARCHAR(20) NOT NULL
                            CHECK (reason IN ('no_match','low_confidence','spoof_suspected','not_enrolled')),
    confidence              REAL,
    candidate_student_id    UUID REFERENCES students(id) ON DELETE SET NULL,
    frame_image             VARCHAR(255),
    resolved                BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_unknown_logs_created_at ON unknown_face_logs(created_at);

-- ---------------------------------------------------------------------
-- Notifications & system
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(10) NOT NULL DEFAULT 'info' CHECK (type IN ('success','warning','info','error')),
    title       VARCHAR(150) NOT NULL,
    body        VARCHAR(500) NOT NULL,
    read        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);

CREATE TABLE activity_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,
    target      VARCHAR(255) NOT NULL DEFAULT '',
    metadata    JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

CREATE TABLE ai_settings (
    id                          SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- singleton row
    confidence_threshold        SMALLINT NOT NULL DEFAULT 94,
    max_head_rotation_degrees   SMALLINT NOT NULL DEFAULT 20,
    anti_spoofing_enabled       BOOLEAN NOT NULL DEFAULT TRUE,
    quality_check_enabled       BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by_id               UUID REFERENCES users(id) ON DELETE SET NULL
);
