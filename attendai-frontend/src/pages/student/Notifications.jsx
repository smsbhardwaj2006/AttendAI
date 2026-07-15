import Icon from '../../components/common/Icon'

const NOTIFICATIONS = [
  { id: 1, type: 'success', title: 'Attendance marked', body: 'Marked present for Data Structures at 09:02 AM', time: '2h ago' },
  { id: 2, type: 'warning', title: 'Low attendance warning', body: 'Your attendance in Operating Systems has dropped to 79%', time: '1d ago' },
  { id: 3, type: 'info', title: 'Session started', body: 'Machine Learning attendance session is now live in Room 302', time: '1d ago' },
  { id: 4, type: 'error', title: 'Attendance missing', body: 'No attendance recorded for Database Management on 13 Jul', time: '2d ago' },
]

const ICON_MAP = { success: 'check', warning: 'alertTriangle', info: 'bell', error: 'x' }
const TONE_MAP = {
  success: 'bg-present/10 text-present',
  warning: 'bg-amber-50 text-late',
  info: 'bg-signal-50 text-signal-600',
  error: 'bg-rose-50 text-absent',
}

export default function Notifications() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink900">Notifications</h2>
          <p className="text-sm text-ink600 mt-1">Attendance updates and alerts</p>
        </div>
        <button className="text-xs font-medium text-signal-600 hover:underline">Mark all read</button>
      </div>

      <div className="card divide-y divide-line">
        {NOTIFICATIONS.map((n) => (
          <div key={n.id} className="flex items-start gap-3 px-5 py-4">
            <div className={`reticle p-2 rounded shrink-0 ${TONE_MAP[n.type]}`}>
              <Icon name={ICON_MAP[n.type]} size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink900">{n.title}</p>
              <p className="text-sm text-ink600 mt-0.5">{n.body}</p>
            </div>
            <span className="text-[11px] font-mono text-ink400 shrink-0">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
