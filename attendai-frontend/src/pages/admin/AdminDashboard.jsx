import StatCard from '../../components/common/StatCard'
import AttendanceLineChart from '../../components/charts/AttendanceLineChart'
import AttendancePieChart from '../../components/charts/AttendancePieChart'
import Icon from '../../components/common/Icon'

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEK_DATA = [92, 89, 94, 87, 91, 78]

const UNKNOWN_LOGS = [
  { id: 1, location: 'Room 204 — Data Structures', time: '09:03 AM', reason: 'Printed photo suspected' },
  { id: 2, location: 'Room 118 — Thermodynamics', time: '10:41 AM', reason: 'Screen replay suspected' },
  { id: 3, location: 'Room 302 — AI Lab', time: '11:15 AM', reason: 'Face not enrolled' },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink900">Overview</h2>
          <p className="text-sm text-ink600 mt-1">Institution-wide attendance and recognition health</p>
        </div>
        <button className="btn-outline">
          <Icon name="download" size={15} />
          Export report
        </button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard eyebrow="Total students" value="2,148" icon="users" delta={3.2} deltaLabel="vs last month" />
        <StatCard eyebrow="Total faculty" value="96" icon="user-check" tone="present" delta={0} deltaLabel="no change" />
        <StatCard eyebrow="Today's attendance" value="91.4%" icon="scan-face" tone="signal" delta={1.8} deltaLabel="vs yesterday" />
        <StatCard eyebrow="Recognition accuracy" value="97.6%" icon="shield-check" tone="present" delta={0.4} deltaLabel="7-day avg" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="stat-eyebrow">This week</p>
              <h3 className="font-display font-semibold text-ink900">Attendance trend</h3>
            </div>
          </div>
          <AttendanceLineChart labels={WEEK_LABELS} data={WEEK_DATA} />
        </div>

        <div className="card p-5">
          <p className="stat-eyebrow mb-1">Today</p>
          <h3 className="font-display font-semibold text-ink900 mb-4">Attendance breakdown</h3>
          <AttendancePieChart labels={['Present', 'Late', 'Absent', 'Spoof flagged']} data={[1963, 84, 92, 9]} />
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div className="flex items-center gap-2">
            <Icon name="alertTriangle" size={16} className="text-spoof" />
            <h3 className="font-display font-semibold text-ink900">Unknown face detection logs</h3>
          </div>
          <button className="text-xs font-medium text-signal-600 hover:underline">View all</button>
        </div>
        <div className="divide-y divide-line">
          {UNKNOWN_LOGS.map((log) => (
            <div key={log.id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm font-medium text-ink900">{log.location}</p>
                <p className="text-xs text-ink400">{log.reason}</p>
              </div>
              <span className="text-xs font-mono text-ink400">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
