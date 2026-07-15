import { useState } from 'react'
import toast from 'react-hot-toast'
import Icon from '../../components/common/Icon'

const INITIAL_QUEUE = [
  { id: 1, name: 'Unknown face', room: 'Room 204', confidence: 41.3, time: '09:03 AM', reason: 'Printed photo suspected', frame: null },
  { id: 2, name: 'Possibly Ishaan Gupta', room: 'Room 118', confidence: 68.2, time: '10:52 AM', reason: 'Low confidence match', frame: null },
  { id: 3, name: 'Unknown face', room: 'Room 302', confidence: 35.7, time: '11:15 AM', reason: 'Screen replay suspected', frame: null },
]

export default function ManualVerification() {
  const [queue, setQueue] = useState(INITIAL_QUEUE)

  const resolve = (id, decision) => {
    setQueue((prev) => prev.filter((q) => q.id !== id))
    toast[decision === 'approved' ? 'success' : 'error'](
      decision === 'approved' ? 'Marked present' : 'Flagged as absent / rejected'
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink900">Manual verification queue</h2>
        <p className="text-sm text-ink600 mt-1">Low-confidence or anti-spoofing flagged detections awaiting review</p>
      </div>

      {queue.length === 0 ? (
        <div className="card py-16 flex flex-col items-center justify-center text-center">
          <div className="reticle p-3 rounded bg-present/10 text-present mb-3">
            <Icon name="check" size={20} />
          </div>
          <p className="text-sm text-ink600">Queue is clear — no pending verifications</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {queue.map((item) => (
            <div key={item.id} className="card p-4">
              <div className="reticle aspect-video rounded bg-ink flex items-center justify-center mb-3">
                <Icon name="scan-face" size={28} className="text-white/30" />
              </div>
              <p className="text-sm font-medium text-ink900">{item.name}</p>
              <p className="text-xs text-ink400 font-mono mt-0.5">
                {item.room} · {item.time}
              </p>
              <p className="text-xs text-spoof mt-1.5 flex items-center gap-1.5">
                <Icon name="alertTriangle" size={12} />
                {item.reason} · {item.confidence}% conf.
              </p>
              <div className="flex gap-2 mt-3">
                <button className="btn-primary flex-1 text-xs py-2" onClick={() => resolve(item.id, 'approved')}>
                  <Icon name="check" size={14} />
                  Mark present
                </button>
                <button className="btn-danger flex-1 text-xs py-2" onClick={() => resolve(item.id, 'rejected')}>
                  <Icon name="x" size={14} />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
