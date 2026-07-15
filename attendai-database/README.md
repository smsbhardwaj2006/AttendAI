# AttendAI — Database

Reference PostgreSQL schema, ERD, and seed data for the AttendAI project's `DATABASE
DESIGN` section (Users, Students, Faculty, Departments, Courses, Subjects, Classrooms,
AttendanceSessions, AttendanceRecords, FaceEmbeddings, Notifications, ActivityLogs).

**The Django backend (`attendai-backend/`) is the source of truth** — its migrations
(generated from `apps/*/models.py`) create and evolve this schema automatically. The files
here exist for documentation, academic evaluation/viva, and for anyone who wants to inspect
or stand up the schema independently of Django.

## Files

- **`schema.sql`** — full DDL (`CREATE TABLE` statements) matching the Django models exactly,
  including constraints, foreign keys, and indexes.
- **`erd.md`** — entity-relationship diagram (Mermaid) plus notes on key design decisions
  (UUID keys, the embeddings storage format, the singleton AI settings row, etc).
- **`seed_data.sql`** — the same demo dataset created by
  `python manage.py seed_demo_data` in the backend, as raw SQL — one admin, one faculty
  member, four students, two sections, three classrooms.

## Using this without Django

```bash
createdb attendai
psql -U attendai_user -d attendai -f schema.sql
psql -U attendai_user -d attendai -f seed_data.sql
```

Note: `seed_data.sql` inserts placeholder password hashes (`'!'`, Django's convention for an
unusable password). To actually log in with these seeded users, either:
- Load the schema via Django instead (`python manage.py migrate && python manage.py seed_demo_data`), which sets real hashed passwords, **or**
- After running `seed_data.sql`, run `python manage.py changepassword <username>` for each account against a Django install pointed at this database.

## Using this alongside Django (recommended)

You don't need to run `schema.sql` at all — just run the backend's migrations:

```bash
cd attendai-backend
python manage.py makemigrations
python manage.py migrate
python manage.py seed_demo_data
```

`schema.sql` and `erd.md` will still match what Django creates; they're kept here purely as
human-readable documentation of the resulting schema for your project report / viva.

## Table summary (per the PRD's Database Design section)

| Table | Purpose |
|---|---|
| `users` | Base auth table (admin/faculty/student), JWT-authenticated |
| `departments`, `courses`, `subjects`, `sections`, `classrooms` | Academic structure |
| `students`, `faculty` | Role-specific profiles linked 1:1 to `users` |
| `face_embeddings` | One row per enrolled face sample; stores the 512-d recognition vector |
| `attendance_sessions` | A faculty-started live attendance window for one subject/section |
| `attendance_records` | One row per student per session — present/late/absent/spoof, confidence, method |
| `unknown_face_logs` | Detections the AI couldn't confidently resolve — feeds admin logs + manual verification |
| `notifications` | In-app notifications per user |
| `activity_logs` | System-wide audit trail |
| `ai_settings` | Singleton row of live-tunable recognition thresholds |
