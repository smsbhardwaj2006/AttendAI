import { useState } from 'react'
import DataTable from '../../components/common/DataTable'
import Modal from '../../components/common/Modal'
import Icon from '../../components/common/Icon'

const DEMO_FACULTY = [
  { id: 1, name: 'Dr. Kavita Nair', empId: 'FAC-1042', dept: 'CSE', subjects: 'Data Structures, DBMS' },
  { id: 2, name: 'Prof. Sanjay Verma', empId: 'FAC-1108', dept: 'ECE', subjects: 'Digital Signal Processing' },
  { id: 3, name: 'Dr. Meera Krishnan', empId: 'FAC-0987', dept: 'AIML', subjects: 'Machine Learning, NLP' },
]

export default function ManageFaculty() {
  const [modalOpen, setModalOpen] = useState(false)

  const columns = [
    { key: 'empId', label: 'Employee ID' },
    { key: 'name', label: 'Name' },
    { key: 'dept', label: 'Department' },
    { key: 'subjects', label: 'Subjects' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink900">Faculty</h2>
          <p className="text-sm text-ink600 mt-1">{DEMO_FACULTY.length} faculty members</p>
        </div>
        <button className="btn-signal" onClick={() => setModalOpen(true)}>
          <Icon name="plus" size={16} />
          Add faculty
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={DEMO_FACULTY}
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
        title="Add faculty"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn-signal" onClick={() => setModalOpen(false)}>
              Save faculty
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" placeholder="e.g. Dr. Arjun Kapoor" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Employee ID</label>
              <input className="input" placeholder="FAC-1204" />
            </div>
            <div>
              <label className="label">Department</label>
              <select className="input">
                <option>Computer Science &amp; Engineering</option>
                <option>Electronics &amp; Communication</option>
                <option>Artificial Intelligence &amp; ML</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Assigned subjects</label>
            <input className="input" placeholder="Comma-separated subject names" />
          </div>
        </div>
      </Modal>
    </div>
  )
}
