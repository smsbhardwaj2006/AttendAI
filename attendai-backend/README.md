# AttendAI — Backend

Django REST Framework backend for the **AI-Based Smart Attendance Monitoring System**,
implementing every module in the PRD: JWT auth & RBAC, student/faculty/academic
management, the AI attendance workflow (detection → alignment → quality check →
anti-spoofing → embedding → matching), reports, notifications, and activity logs.

Pairs with the `attendai-frontend` React app — every endpoint below matches a call in
`src/api/*.js` on the frontend.

## Stack

Python · Django 5 · Django REST Framework · Simple JWT · PostgreSQL · OpenCV · InsightFace ·
MediaPipe · ONNX Runtime · NumPy · Pandas · Scikit-learn

## Quick start (local, without Docker)

```bash
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env with your PostgreSQL credentials

createdb attendai   # or create the DB through pgAdmin / psql

python manage.py makemigrations
python manage.py migrate
python manage.py seed_demo_data     # optional — creates demo admin/faculty/students
python manage.py createsuperuser    # optional — if you skipped seeding

python manage.py runserver
```

The API is now live at `http://localhost:8000/api/`. Point the frontend's
`VITE_API_BASE_URL` at that address.

## Quick start (Docker)

```bash
cp .env.example .env
docker compose up --build
docker compose exec backend python manage.py seed_demo_data
```

## Demo accounts (after `seed_demo_data`)

| Role | Email | Password |
|---|---|---|
| Admin | admin@attendai.edu | AttendAI@2026 |
| Faculty | kavita.nair@attendai.edu | AttendAI@2026 |
| Student | aarav.sharma@attendai.edu | AttendAI@2026 |

## AI recognition engine

Runs in **demo mode** by default (`AI_DEMO_MODE=True` in `.env`) so the full attendance
workflow — enrollment, live recognition, anti-spoofing flags, manual verification — works
out of the box without downloading InsightFace's model weights or needing a GPU. See
`apps/ai_engine/README.md` for how each PRD AI module is implemented and how to switch to
real models for production accuracy.

## API reference

All routes are prefixed with `/api/`. JWT bearer auth on every route except `/auth/login/`
and `/auth/token/refresh/`.

### Auth (`apps.accounts`)
| Method | Path | Notes |
|---|---|---|
| POST | `/auth/login/` | `{email, password}` → `{access, refresh, user}` |
| POST | `/auth/logout/` | Blacklists the refresh token |
| GET | `/auth/me/` | Restores session on frontend reload |
| POST | `/auth/token/refresh/` | Simple JWT refresh |
| POST | `/auth/change-password/` | |

### Academics (`apps.academics`) — Admin/Faculty
`GET/POST /departments/` · `GET /courses/` · `GET /subjects/` · `GET /sections/` · `GET /classrooms/`

### Students (`apps.students`) — Admin/Faculty
| Method | Path |
|---|---|
| GET/POST | `/students/` |
| GET/PATCH/DELETE | `/students/{id}/` |
| GET | `/students/{id}/attendance/` |
| POST | `/students/{id}/face-enrollment/` — multipart, field `samples` (up to 5 images) |
| GET | `/students/{id}/face-enrollment/status/` |

### Faculty (`apps.faculty`) — Admin
`GET/POST /faculty/` · `GET/PATCH/DELETE /faculty/{id}/` · `POST /faculty/{id}/subjects/`

### Attendance (`apps.attendance`) — Admin/Faculty
| Method | Path | Notes |
|---|---|---|
| GET/POST | `/attendance/sessions/` | Faculty creates a session for their subject/section |
| GET | `/attendance/sessions/{id}/` | |
| POST | `/attendance/sessions/{id}/end/` | |
| POST | `/attendance/sessions/{id}/recognize/` | multipart field `frame` — the live-recognition loop |
| GET | `/attendance/sessions/{id}/records/` | |
| PATCH | `/attendance/records/{id}/` | Manual correction |
| GET | `/attendance/sessions/{id}/verification-queue/` | |
| GET | `/attendance/summary/daily/` `/monthly/` `/subject-wise/` `/heatmap/` | |
| GET | `/attendance/unknown-faces/` | Feeds the Admin dashboard's spoof/no-match log widget |

### Reports (`apps.reports`) — Admin/Faculty
`GET /reports/daily/` `/weekly/` `/monthly/` `/subject-wise/` `/student-wise/` ·
`GET /reports/export/csv/` · `GET /reports/export/pdf/`

### Notifications (`apps.notifications`) — any authenticated user
`GET /notifications/` · `PATCH /notifications/{id}/` · `POST /notifications/mark-all-read/`

### Admin (`apps.core`) — Admin only
`GET /admin/activity-logs/` · `GET/PATCH /admin/ai-settings/` · `GET /admin/stats/`

## Project structure

```
config/                  Django project settings, root urls, wsgi/asgi
apps/
  accounts/               Custom User model (role-based), JWT login/logout/me
  academics/               Department, Course, Subject, Section, Classroom
  students/                Student profiles, FaceEmbedding, enrollment endpoints
  faculty/                 Faculty profiles, subject assignment
  attendance/               Sessions, records, unknown-face logs, live recognition, summaries
  ai_engine/                 Face detection, quality validation, anti-spoofing, recognition, pipeline
  reports/                    Daily/weekly/monthly/subject/student reports, CSV/PDF export
  notifications/               In-app notifications
  core/                        ActivityLog, AISettings, dashboard stats, demo data seeding
```

## Notes on the data model

`apps/students/models.FaceEmbedding.vector` stores embeddings as a `JSONField` (portable
across any PostgreSQL install). If you have the `pgvector` extension available, swap it for
`VectorField(dimensions=512)` and add an approximate-nearest-neighbor index — this matters
once you're matching against thousands of enrolled students in real time; the JSON approach
does an in-Python cosine-similarity scan per session's roster, which is fine at classroom
scale (tens of students) but won't scale to whole-institution 1:N search.

See `database/` at the repository root (sibling to this backend) for the raw SQL schema,
an ERD, and seed data — useful if you want to inspect or stand up the schema without
running Django migrations.
