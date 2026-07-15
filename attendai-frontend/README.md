# AttendAI — Frontend

React frontend for the **AI-Based Smart Attendance Monitoring System** capstone project.
Built with React 18, Vite, Tailwind CSS, React Router, Axios, and Chart.js, matching the
technology stack and modules defined in the project PRD.

## What's included

- **Role-based dashboards** for Admin, Faculty, and Student, each with its own layout, sidebar
  navigation, and protected routes (`src/components/common/ProtectedRoute.jsx`).
- **JWT auth flow** with automatic access-token refresh (`src/api/axiosClient.js`,
  `src/context/AuthContext.jsx`).
- **Face enrollment UI** — multi-sample webcam capture flow with pose prompts
  (`src/components/face/FaceEnrollmentCapture.jsx`).
- **Live attendance monitoring UI** — camera feed with a simulated recognition stream showing
  confidence scores and anti-spoofing status, wired to poll a recognition endpoint
  (`src/components/face/LiveAttendanceMonitor.jsx`).
- **Admin**: student/faculty management, departments & courses, activity logs, AI recognition
  settings (confidence threshold, anti-spoofing, quality checks).
- **Faculty**: attendance sessions, live monitoring, manual verification queue, subject-wise
  reports with CSV/PDF export triggers.
- **Student**: attendance dashboard, face enrollment, attendance history, notifications.
- **Chart.js visualizations**: attendance trend lines, subject-wise bar charts, status breakdown
  donut charts.
- A complete Axios API layer (`src/api/`) with one file per backend module (auth, students,
  faculty, attendance, reports, notifications) — each function maps directly to a DRF endpoint
  you can implement on the backend.

## Design system

The UI uses a "recognition tech" visual language distinct from generic admin-dashboard
templates: an ink-navy/paper palette with a cyan **signal** accent standing in for AI
recognition moments, Space Grotesk for display type, Inter for body/UI text, and JetBrains Mono
for data (IDs, timestamps, confidence scores). The signature visual motif is a **reticle** —
camera-viewfinder corner brackets — applied to avatars, stat card icons, and the live camera
frame, echoing the face-detection bounding boxes central to the product. Tokens live in
`tailwind.config.js` and `src/index.css`.

## Getting started

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your Django backend
npm run dev
```

The app runs at `http://localhost:5173`.

### Trying it without a backend

The **Login** page has three "Preview dashboards" buttons (Admin / Faculty / Student) that log
you in locally with mock data, so you can review every screen before the Django REST API is
wired up. Demo data used throughout the dashboards is clearly marked in each page file and
should be replaced with real API calls once the backend is available — the API client functions
are already written and just need a live endpoint at `VITE_API_BASE_URL`.

## Connecting to the Django backend

1. Set `VITE_API_BASE_URL` in `.env` to your DRF server, e.g. `http://localhost:8000/api`.
2. Implement the endpoints referenced in `src/api/*.js` — each file documents which PRD module
   it maps to (Authentication, Student Management, Faculty Management, Attendance Management,
   Reports, Notifications, Admin/AI settings).
3. Expected auth response shape from `POST /auth/login/`:
   ```json
   { "access": "...", "refresh": "...", "user": { "id": 1, "name": "...", "email": "...", "role": "admin" } }
   ```
   `role` must be one of `admin`, `faculty`, `student` — this drives which dashboard the user is
   routed to and which routes they're allowed to access.
4. The live attendance monitor posts JPEG frames as `multipart/form-data` to
   `POST /attendance/sessions/:id/recognize/` every 2.5s while a session is running, and expects
   a `recognitions[]` array back (name, rollNo, confidence, status, time) to render in the feed.
5. Face enrollment posts 5 captured samples via `studentsApi.enrollFace(id, formData)` — wire
   this up in `src/pages/student/FaceEnrollment.jsx`'s `submit()` function once the endpoint
   exists.

## Project structure

```
src/
  api/            Axios client + one module per backend domain
  components/
    charts/       Chart.js wrappers (line, bar, donut)
    common/       Icon, Modal, DataTable, StatCard, Loader, ProtectedRoute
    face/         Webcam-based enrollment + live monitoring widgets
    layout/       Sidebar, Navbar, DashboardLayout
  context/        AuthContext (JWT session state)
  pages/
    auth/         Login
    admin/        Dashboard, Students, Faculty, Departments, Activity Logs, AI Settings
    faculty/      Dashboard, Sessions, Live monitoring, Verification queue, Reports
    student/      Dashboard, Face enrollment, History, Notifications
  routes/         (reserved for future route config extraction)
  utils/          constants (nav config, roles), helpers (formatting)
```

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

## Notes

- `react-webcam` requires the browser to grant camera permissions; both face-related widgets
  degrade gracefully with a toast message if access is denied.
- All dummy/demo data is isolated at the top of each page file (`DEMO_*` / `USE_DEMO_DATA`
  constants) so it's easy to find and remove once real endpoints are connected.
- Tailwind's `content` scanning is limited to `index.html` and `src/**/*.{js,jsx}` — keep new
  files inside `src/`.
