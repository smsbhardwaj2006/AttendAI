import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import { ADMIN_NAV, FACULTY_NAV, STUDENT_NAV, ROLES } from './utils/constants'

import Login from './pages/auth/Login'
import NotFound from './pages/NotFound'

import AdminDashboard from './pages/admin/AdminDashboard'
import ManageStudents from './pages/admin/ManageStudents'
import ManageFaculty from './pages/admin/ManageFaculty'
import ManageDepartments from './pages/admin/ManageDepartments'
import ActivityLogs from './pages/admin/ActivityLogs'
import SystemSettings from './pages/admin/SystemSettings'

import FacultyDashboard from './pages/faculty/FacultyDashboard'
import AttendanceSessions from './pages/faculty/AttendanceSessions'
import StartAttendance from './pages/faculty/StartAttendance'
import ManualVerification from './pages/faculty/ManualVerification'
import SubjectReports from './pages/faculty/SubjectReports'

import StudentDashboard from './pages/student/StudentDashboard'
import FaceEnrollment from './pages/student/FaceEnrollment'
import AttendanceHistory from './pages/student/AttendanceHistory'
import Notifications from './pages/student/Notifications'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<NotFound code="403" message="You don't have permission to view this page." />} />

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<DashboardLayout navItems={ADMIN_NAV} role="Admin" title="Admin Console" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<ManageStudents />} />
          <Route path="/admin/faculty" element={<ManageFaculty />} />
          <Route path="/admin/departments" element={<ManageDepartments />} />
          <Route path="/admin/activity-logs" element={<ActivityLogs />} />
          <Route path="/admin/settings" element={<SystemSettings />} />
        </Route>
      </Route>

      {/* Faculty */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.FACULTY]} />}>
        <Route element={<DashboardLayout navItems={FACULTY_NAV} role="Faculty" title="Faculty Portal" />}>
          <Route path="/faculty" element={<FacultyDashboard />} />
          <Route path="/faculty/sessions" element={<AttendanceSessions />} />
          <Route path="/faculty/sessions/live" element={<StartAttendance />} />
          <Route path="/faculty/sessions/live/:sessionId" element={<StartAttendance />} />
          <Route path="/faculty/verification" element={<ManualVerification />} />
          <Route path="/faculty/reports" element={<SubjectReports />} />
        </Route>
      </Route>

      {/* Student */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
        <Route element={<DashboardLayout navItems={STUDENT_NAV} role="Student" title="My Attendance" />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/enrollment" element={<FaceEnrollment />} />
          <Route path="/student/history" element={<AttendanceHistory />} />
          <Route path="/student/notifications" element={<Notifications />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
