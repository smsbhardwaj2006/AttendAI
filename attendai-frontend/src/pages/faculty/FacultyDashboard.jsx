import { Link } from 'react-router-dom'
import StatCard from '../../components/common/StatCard'
import AttendanceBarChart from '../../components/charts/AttendanceBarChart'
import Icon from '../../components/common/Icon'
import { statusBadgeClass } from '../../utils/helpers'

const SUBJECTS = [
  { id: 1, name: 'Data Structures', section: 'CSE-A', attendance: 92 },
  { id: 2, name: 'Database Management', section: 'CSE-B', attendance: 87 },
  { id: 3, name: 'Operating Systems', section: 'CSE-A', attendance: 81 },
]

const LATE_STUDENTS = [
  { id: 1, name: 'Rohan Mehta', subject: 'Data Structures', time: '09:07 AM', status: 'late' },
  { id: 2, name: 'Ishaan Gupta', subject: 'Operating Systems', time: '10:52 AM', status: 'late' },
]

export default function FacultyDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink900">Today's overview</h2>
          <p className="text-sm text-ink600 mt-1">Wednesday, July 15 — 3 sessions scheduled</p>
        </div>
        <Link to="/faculty/sessions" className="btn-signal">
          <Icon name="video" size={16} />
          Start attendance
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard eyebrow="Today's attendance" value="88.6%" icon="scan-face" delta={2.1} deltaLabel="vs last class" />
        <StatCard eyebrow="Sessions held" value="3" icon="video" tone="present" />
        <StatCard eyebrow="Pending verification" value="4" icon="shield-check" tone="late" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <p className="stat-eyebrow mb-1">Subject-wise</p>
          <h3 className="font-display font-semibold text-ink900 mb-4">Attendance by subject</h3>
          <AttendanceBarChart
            labels={SUBJECTS.map((s) => s.name)}
            data={SUBJECTS.map((s) => s.attendance)}
            label="Attendance %"
          />
        </div>

        <div className="card">
          <div className="px-5 py-4 border-b border-line">
            <h3 className="font-display font-semibold text-ink900">Late arrivals</h3>
          </div>
          <div className="divide-y divide-line">
            {LATE_STUDENTS.map((s) => (
              <div key={s.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink900">{s.name}</p>
                  <p className="text-xs text-ink400">{s.subject}</p>
                </div>
                <div className="text-right">
                  <span className={statusBadgeClass(s.status)}>{s.status}</span>
                  <p className="text-[11px] font-mono text-ink400 mt-1">{s.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <h3 className="font-display font-semibold text-ink900">My subjects</h3>
        </div>
        <div className="divide-y divide-line">
          {SUBJECTS.map((s) => (
            <div key={s.id} className="px-5 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink900">{s.name}</p>
                <p className="text-xs text-ink400">{s.section}</p>
              </div>
              <p className="text-sm font-mono text-ink600">{s.attendance}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
