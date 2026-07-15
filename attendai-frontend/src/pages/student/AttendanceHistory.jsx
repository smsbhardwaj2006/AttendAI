import { useState } from 'react'
import DataTable from '../../components/common/DataTable'
import Icon from '../../components/common/Icon'
import { statusBadgeClass } from '../../utils/helpers'

const HISTORY = [
  { id: 1, date: '15 Jul 2026', subject: 'Data Structures', status: 'present', time: '09:02 AM' },
  { id: 2, date: '14 Jul 2026', subject: 'Operating Systems', status: 'late', time: '10:07 AM' },
  { id: 3, date: '14 Jul 2026', subject: 'Machine Learning', status: 'present', time: '02:01 PM' },
  { id: 4, date: '13 Jul 2026', subject: 'Database Management', status: 'absent', time: '—' },
  { id: 5, date: '12 Jul 2026', subject: 'Data Structures', status: 'present', time: '09:00 AM' },
]

export default function AttendanceHistory() {
  const [filter, setFilter] = useState('all')

  const rows = filter === 'all' ? HISTORY : HISTORY.filter((h) => h.status === filter)

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'subject', label: 'Subject' },
    { key: 'status', label: 'Status', render: (r) => <span className={statusBadgeClass(r.status)}>{r.status}</span> },
    { key: 'time', label: 'Marked at' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink900">Attendance history</h2>
        <p className="text-sm text-ink600 mt-1">Full record of your marked attendance</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {['all', 'present', 'late', 'absent'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
              filter === f ? 'bg-ink text-white' : 'bg-white border border-line text-ink600 hover:bg-paper'
            }`}
          >
            {f}
          </button>
        ))}
        <button className="ml-auto btn-outline text-xs px-3 py-1.5">
          <Icon name="download" size={14} />
          Export
        </button>
      </div>

      <DataTable columns={columns} rows={rows} />
    </div>
  )
}
