import { useState } from 'react'
import DataTable from '../../components/common/DataTable'
import Modal from '../../components/common/Modal'
import Icon from '../../components/common/Icon'
import { statusBadgeClass } from '../../utils/helpers'

const DEMO_STUDENTS = [
  { id: 1, name: 'Aarav Sharma', rollNo: 'CS21B045', dept: 'CSE', section: 'A', enrollment: 'present', attendance: '94.2%' },
  { id: 2, name: 'Diya Patel', rollNo: 'CS21B012', dept: 'CSE', section: 'A', enrollment: 'present', attendance: '91.8%' },
  { id: 3, name: 'Rohan Mehta', rollNo: 'CS21B078', dept: 'CSE', section: 'B', enrollment: 'late', attendance: '76.5%' },
  { id: 4, name: 'Sneha Iyer', rollNo: 'EC21B033', dept: 'ECE', section: 'A', enrollment: 'absent', attendance: '58.1%' },
]

export default function ManageStudents() {
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = DEMO_STUDENTS.filter(
    (s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.rollNo.toLowerCase().includes(query.toLowerCase())
  )

  const columns = [
    { key: 'rollNo', label: 'Roll no.' },
    { key: 'name', label: 'Name' },
    { key: 'dept', label: 'Department' },
    { key: 'section', label: 'Section' },
    {
      key: 'enrollment',
      label: 'Face status',
      render: (row) => <span className={statusBadgeClass(row.enrollment)}>{row.enrollment}</span>,
    },
    { key: 'attendance', label: 'Attendance' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink900">Students</h2>
          <p className="text-sm text-ink600 mt-1">{DEMO_STUDENTS.length} enrolled students</p>
        </div>
        <button className="btn-signal" onClick={() => setModalOpen(true)}>
          <Icon name="plus" size={16} />
          Add student
        </button>
      </div>

      <div className="relative max-w-sm">
        <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink400" />
        <input
          className="input pl-9"
          placeholder="Search by name or roll number"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        actions={() => (
          <div className="flex items-center gap-2 justify-end">
            <button className="text-ink400 hover:text-signal-600" aria-label="Edit">
              <Icon name="edit" size={15} />
            </button>
            <button className="text-ink400 hover:text-absent" aria-label="Delete">
              <Icon name="trash" size={15} />
            </button>
          </div>
        )}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add student"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn-signal" onClick={() => setModalOpen(false)}>
              Save student
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" placeholder="e.g. Ananya Rao" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Roll number</label>
              <input className="input" placeholder="CS22B021" />
            </div>
            <div>
              <label className="label">Section</label>
              <input className="input" placeholder="A" />
            </div>
          </div>
          <div>
            <label className="label">Department</label>
            <select className="input">
              <option>Computer Science &amp; Engineering</option>
              <option>Electronics &amp; Communication</option>
              <option>Mechanical Engineering</option>
              <option>Artificial Intelligence &amp; ML</option>
            </select>
          </div>
          <p className="text-xs text-ink400">Face enrollment can be completed by the student after account creation.</p>
        </div>
      </Modal>
    </div>
  )
}
