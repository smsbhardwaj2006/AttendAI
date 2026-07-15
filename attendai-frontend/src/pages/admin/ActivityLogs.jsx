import DataTable from '../../components/common/DataTable'
import Icon from '../../components/common/Icon'

const LOGS = [
  { id: 1, actor: 'Dr. Kavita Nair', action: 'Started attendance session', target: 'Data Structures — Room 204', time: '09:01 AM' },
  { id: 2, actor: 'System', action: 'Flagged spoof attempt', target: 'Room 204', time: '09:03 AM' },
  { id: 3, actor: 'Admin', action: 'Added new student', target: 'Ananya Rao (CS22B021)', time: '10:12 AM' },
  { id: 4, actor: 'Prof. Sanjay Verma', action: 'Manually corrected attendance', target: 'Rohan Mehta — Present', time: '11:20 AM' },
  { id: 5, actor: 'Admin', action: 'Updated AI confidence threshold', target: '92% → 94%', time: '01:45 PM' },
]

export default function ActivityLogs() {
  const columns = [
    { key: 'time', label: 'Time' },
    { key: 'actor', label: 'Actor' },
    { key: 'action', label: 'Action' },
    { key: 'target', label: 'Target' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Icon name="clock" size={18} className="text-signal-600" />
        <h2 className="font-display text-2xl font-semibold text-ink900">Activity logs</h2>
      </div>
      <p className="text-sm text-ink600 -mt-3">System-wide audit trail of user and AI-triggered actions</p>
      <DataTable columns={columns} rows={LOGS} />
    </div>
  )
}
