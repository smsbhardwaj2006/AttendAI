import { useState } from 'react'
import toast from 'react-hot-toast'
import DataTable from '../../components/common/DataTable'
import Icon from '../../components/common/Icon'
import { statusBadgeClass } from '../../utils/helpers'

const REPORT_ROWS = [
  { id: 1, rollNo: 'CS21B045', name: 'Aarav Sharma', status: 'present', time: '09:02 AM', confidence: '98.2%' },
  { id: 2, rollNo: 'CS21B012', name: 'Diya Patel', status: 'present', time: '09:02 AM', confidence: '96.7%' },
  { id: 3, rollNo: 'CS21B078', name: 'Rohan Mehta', status: 'late', time: '09:07 AM', confidence: '94.1%' },
  { id: 4, rollNo: 'CS21B033', name: 'Sneha Iyer', status: 'absent', time: '—', confidence: '—' },
]

export default function SubjectReports() {
  const [subject, setSubject] = useState('Data Structures')

  const columns = [
    { key: 'rollNo', label: 'Roll no.' },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status', render: (r) => <span className={statusBadgeClass(r.status)}>{r.status}</span> },
    { key: 'time', label: 'Marked at' },
    { key: 'confidence', label: 'Confidence' },
  ]

  const handleExport = (fmt) => toast.success(`Exporting ${fmt.toUpperCase()} report…`)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink900">Subject-wise reports</h2>
          <p className="text-sm text-ink600 mt-1">Attendance detail for a selected subject and date</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={() => handleExport('csv')}>
            <Icon name="download" size={15} />
            CSV
          </button>
          <button className="btn-outline" onClick={() => handleExport('pdf')}>
            <Icon name="download" size={15} />
            PDF
          </button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <select className="input max-w-xs" value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option>Data Structures</option>
          <option>Database Management</option>
          <option>Operating Systems</option>
        </select>
        <input type="date" className="input max-w-xs" defaultValue="2026-07-15" />
      </div>

      <DataTable columns={columns} rows={REPORT_ROWS} />
    </div>
  )
}
