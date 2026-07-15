# AttendAI — Entity Relationship Diagram

Mirrors `schema.sql`. Paste the block below into any Mermaid renderer (GitHub renders it
natively, or use https://mermaid.live) to view it visually.

```mermaid
erDiagram
    USERS ||--o| STUDENTS : "has profile"
    USERS ||--o| FACULTY : "has profile"
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ ACTIVITY_LOGS : performs

    DEPARTMENTS ||--o{ COURSES : offers
    DEPARTMENTS ||--o{ FACULTY : employs
    COURSES ||--o{ SUBJECTS : contains
    COURSES ||--o{ SECTIONS : has
    COURSES ||--o{ STUDENTS : enrolls

    SECTIONS ||--o{ STUDENTS : groups
    SECTIONS ||--o{ ATTENDANCE_SESSIONS : "held for"

    SUBJECTS ||--o{ ATTENDANCE_SESSIONS : "taught in"
    SUBJECTS }o--o{ FACULTY : "assigned to (faculty_subjects)"

    CLASSROOMS ||--o{ ATTENDANCE_SESSIONS : hosts
    CLASSROOMS }o--o{ FACULTY : "assigned to (faculty_classrooms)"
    CLASSROOMS ||--o{ UNKNOWN_FACE_LOGS : "detected in"

    FACULTY ||--o{ ATTENDANCE_SESSIONS : conducts

    STUDENTS ||--o{ FACE_EMBEDDINGS : enrolls
    STUDENTS ||--o{ ATTENDANCE_RECORDS : "marked in"
    STUDENTS ||--o{ UNKNOWN_FACE_LOGS : "candidate match"

    ATTENDANCE_SESSIONS ||--o{ ATTENDANCE_RECORDS : contains
    ATTENDANCE_SESSIONS ||--o{ UNKNOWN_FACE_LOGS : logs

    USERS {
        uuid id PK
        string email UK
        string role "admin | faculty | student"
        string password
        bool is_active_profile
    }

    DEPARTMENTS {
        uuid id PK
        string name UK
        string code UK
    }

    COURSES {
        uuid id PK
        uuid department_id FK
        string name
        string code
    }

    SUBJECTS {
        uuid id PK
        uuid course_id FK
        string name
        string code
        smallint semester
    }

    SECTIONS {
        uuid id PK
        uuid course_id FK
        string name
        smallint semester
    }

    CLASSROOMS {
        uuid id PK
        string name UK
        string camera_id
    }

    STUDENTS {
        uuid id PK
        uuid user_id FK
        string roll_no UK
        uuid course_id FK
        uuid section_id FK
        string face_enrollment_status
    }

    FACULTY {
        uuid id PK
        uuid user_id FK
        string employee_id UK
        uuid department_id FK
    }

    FACE_EMBEDDINGS {
        uuid id PK
        uuid student_id FK
        jsonb vector "512-d embedding"
        real quality_score
        bool is_active
    }

    ATTENDANCE_SESSIONS {
        uuid id PK
        uuid subject_id FK
        uuid section_id FK
        uuid classroom_id FK
        uuid faculty_id FK
        string status
        timestamptz started_at
        timestamptz ended_at
    }

    ATTENDANCE_RECORDS {
        uuid id PK
        uuid session_id FK
        uuid student_id FK
        string status "present|late|absent|spoof_detected"
        real confidence
        string method "auto|manual"
        bool needs_verification
    }

    UNKNOWN_FACE_LOGS {
        uuid id PK
        uuid session_id FK
        uuid classroom_id FK
        string reason
        real confidence
        uuid candidate_student_id FK
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string type
        bool read
    }

    ACTIVITY_LOGS {
        uuid id PK
        uuid actor_id FK
        string action
        jsonb metadata
    }

    AI_SETTINGS {
        smallint id PK "singleton, always 1"
        smallint confidence_threshold
        bool anti_spoofing_enabled
    }
```

## Design notes

- **UUID primary keys** everywhere, matching the Django models (`models.UUIDField`) — avoids
  exposing sequential IDs and simplifies merging data from multiple camera/classroom sources.
- **`face_embeddings.vector` as JSONB**: portable across any Postgres install with no extra
  extensions. If you enable `pgvector`, switch this column to `VECTOR(512)` and add an
  IVFFlat/HNSW index — worthwhile once you're matching against an entire institution's
  roster rather than one section (tens of students) per live session.
- **`attendance_records` is unique per `(session_id, student_id)`**: a session is pre-seeded
  with one `absent` record per student in the section when it starts, then flipped to
  `present`/`late` as the AI recognizes faces — so the roster is always complete, never
  missing no-shows.
- **`ai_settings` is a singleton table** (`id` constrained to `1`) holding the live-tunable
  recognition thresholds shown on the Admin > AI Settings screen, separate from the
  `.env`-level defaults used before the table is first populated.
- **`unknown_face_logs`** captures every detection the AI pipeline couldn't confidently
  resolve (no match, low confidence, suspected spoof) — this is what feeds both the Admin
  dashboard's "Unknown Face Detection Logs" widget and the Faculty manual verification queue.
