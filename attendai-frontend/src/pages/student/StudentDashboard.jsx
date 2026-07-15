import StatCard from '../../components/common/StatCard'
import AttendanceLineChart from '../../components/charts/AttendanceLineChart'
import Icon from '../../components/common/Icon'
import { statusBadgeClass } from '../../utils/helpers'

const TREND_LABELS = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
const TREND_DATA = [88, 91, 85, 93, 90, 92]

const SUBJECT_ATTENDANCE = [
  { id: 1, name: 'Data Structures', percent: 94 },
  { id: 2, name: 'Database Management', percent: 88 },
  { id: 3, name: 'Operating Systems', percent: 79 },
  { id: 4, name: 'Machine Learning', percent: 96 },
]

const RECENT = [
  { id: 1, subject: 'Data Structures', date: '15 Jul 2026', status: 'present' },
  { id: 2, subject: 'Operating Systems', date: '14 Jul 2026', status: 'late' },
  { id: 3, subject: 'Machine Learning', date: '14 Jul 2026', status: 'present' },
  { id: 4, subject: 'Database Management', date: '13 Jul 2026', status: 'absent' },
]

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink900">Your attendance</h2>
        <p className="text-sm text-ink600 mt-1">Overall standing across all enrolled subjects</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard eyebrow="Overall attendance" value="89.4%" icon="scan-face" delta={1.2} deltaLabel="vs last month" />
        <StatCard eyebrow="Classes attended" value="142/159" icon="calendar" tone="present" />
        <StatCard eyebrow="Subjects below 75%" value="0" icon="alertTriangle" tone="late" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <p className="stat-eyebrow mb-1">Last 6 months</p>
          <h3 className="font-display font-semibold text-ink900 mb-4">Attendance trend</h3>
          <AttendanceLineChart labels={TREND_LABELS} data={TREND_DATA} />
        </div>

        <div className="card">
          <div className="px-5 py-4 border-b border-line">
            <h3 className="font-display font-semibold text-ink900">Subject-wise</h3>
          </div>
          <div className="divide-y divide-line">
            {SUBJECT_ATTENDANCE.map((s) => (
              <div key={s.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm text-ink900">{s.name}</p>
                  <p className="text-xs font-mono text-ink600">{s.percent}%</p>
                </div>
                <div className="h-1.5 rounded-full bg-line overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.percent < 75 ? 'bg-absent' : 'bg-signal-500'}`}
                    style={{ width: `${s.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <h3 className="font-display font-semibold text-ink900">Recent activity</h3>
          <Icon name="calendar" size={16} className="text-ink400" />
        </div>
        <div className="divide-y divide-line">
          {RECENT.map((r) => (
            <div key={r.id} className="px-5 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink900">{r.subject}</p>
                <p className="text-xs text-ink400">{r.date}</p>
              </div>
              <span className={statusBadgeClass(r.status)}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
