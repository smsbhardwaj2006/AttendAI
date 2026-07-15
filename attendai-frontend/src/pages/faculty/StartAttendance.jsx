import { useParams } from 'react-router-dom'
import LiveAttendanceMonitor from '../../components/face/LiveAttendanceMonitor'

export default function StartAttendance() {
  const { sessionId } = useParams()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink900">Live attendance — Data Structures</h2>
        <p className="text-sm text-ink600 mt-1">CSE-A · Room 204 · Session #{sessionId || 'new'}</p>
      </div>
      <LiveAttendanceMonitor sessionId={sessionId} />
    </div>
  )
}
