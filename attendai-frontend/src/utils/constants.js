export const ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
}

// When the Django backend isn't running yet, the dashboards fall back to
// this sample data so the UI can be reviewed end-to-end during development.
export const USE_DEMO_DATA = true

export const ADMIN_NAV = [
  { label: 'Dashboard', to: '/admin', icon: 'grid' },
  { label: 'Students', to: '/admin/students', icon: 'users' },
  { label: 'Faculty', to: '/admin/faculty', icon: 'user-check' },
  { label: 'Departments', to: '/admin/departments', icon: 'layers' },
  { label: 'Activity Logs', to: '/admin/activity-logs', icon: 'clock' },
  { label: 'AI Settings', to: '/admin/settings', icon: 'sliders' },
]

export const FACULTY_NAV = [
  { label: 'Dashboard', to: '/faculty', icon: 'grid' },
  { label: 'Sessions', to: '/faculty/sessions', icon: 'video' },
  { label: 'Verification Queue', to: '/faculty/verification', icon: 'shield-check' },
  { label: 'Reports', to: '/faculty/reports', icon: 'bar-chart' },
]

export const STUDENT_NAV = [
  { label: 'Dashboard', to: '/student', icon: 'grid' },
  { label: 'Face Enrollment', to: '/student/enrollment', icon: 'scan-face' },
  { label: 'Attendance History', to: '/student/history', icon: 'calendar' },
  { label: 'Notifications', to: '/student/notifications', icon: 'bell' },
]
