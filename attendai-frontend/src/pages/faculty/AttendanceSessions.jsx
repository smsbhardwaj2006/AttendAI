import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/common/Icon'
import Modal from '../../components/common/Modal'

const SESSIONS = [
  { id: 1, subject: 'Data Structures', section: 'CSE-A', room: 'Room 204', time: '09:00 AM', status: 'completed', present: '58/62' },
  { id: 2, subject: 'Database Management', section: 'CSE-B', room: 'Room 118', time: '11:00 AM', status: 'completed', present: '49/56' },
  { id: 3, subject: 'Operating Systems', section: 'CSE-A', room: 'Room 302', time: '02:00 PM', status: 'scheduled', present: '—' },
]

export default function AttendanceSessions() {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink900">Attendance sessions</h2>
          <p className="text-sm text-ink600 mt-1">Create and manage live attendance sessions</p>
        </div>
        <button className="btn-signal" onClick={() => setModalOpen(true)}>
          <Icon name="plus" size={16} />
          New session
        </button>
      </div>

      <div className="grid gap-4">
        {SESSIONS.map((s) => (
          <div key={s.id} className="card p-5 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`reticle p-3 rounded ${s.status === 'scheduled' ? 'bg-signal-50 text-signal-600' : 'bg-present/10 text-present'}`}>
                <Icon name="video" size={18} />
              </div>
              <div>
                <p className="font-medium text-ink900">{s.subject}</p>
                <p className="text-xs text-ink400 font-mono">
                  {s.section} · {s.room} · {s.time}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-mono text-ink900">{s.present}</p>
                <p className="text-[11px] text-ink400 uppercase">Present</p>
              </div>
              {s.status === 'scheduled' ? (
                <button className="btn-signal" onClick={() => navigate('/faculty/sessions/live')}>
                  <Icon name="play" size={15} />
                  Start
                </button>
              ) : (
                <button className="btn-outline" onClick={() => navigate('/faculty/reports')}>
                  View report
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create attendance session"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn-signal"
              onClick={() => {
                setModalOpen(false)
                navigate('/faculty/sessions/live')
              }}
            >
              Create &amp; start
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Subject</label>
            <select className="input">
              <option>Data Structures</option>
              <option>Database Management</option>
              <option>Operating Systems</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Section</label>
              <input className="input" placeholder="CSE-A" />
            </div>
            <div>
              <label className="label">Classroom</label>
              <input className="input" placeholder="Room 204" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
