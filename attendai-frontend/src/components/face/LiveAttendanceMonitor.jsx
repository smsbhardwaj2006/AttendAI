import { useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import Icon from '../common/Icon'
import { statusBadgeClass } from '../../utils/helpers'
import { attendanceApi } from '../../api/attendance'
import { USE_DEMO_DATA } from '../../utils/constants'

const DEMO_FEED = [
  { id: 1, name: 'Aarav Sharma', rollNo: 'CS21B045', confidence: 98.2, status: 'present', time: '09:02 AM' },
  { id: 2, name: 'Diya Patel', rollNo: 'CS21B012', confidence: 96.7, status: 'present', time: '09:02 AM' },
  { id: 3, name: 'Unknown face', rollNo: '—', confidence: 41.3, status: 'spoof_detected', time: '09:03 AM' },
  { id: 4, name: 'Rohan Mehta', rollNo: 'CS21B078', confidence: 94.1, status: 'late', time: '09:07 AM' },
]

/**
 * Implements the live attendance workflow: opens the camera, periodically
 * sends frames to the recognition endpoint, and streams recognized faces
 * into a live feed with confidence scores + anti-spoofing status.
 */
export default function LiveAttendanceMonitor({ sessionId }) {
  const webcamRef = useRef(null)
  const [running, setRunning] = useState(false)
  const [feed, setFeed] = useState(USE_DEMO_DATA ? DEMO_FEED : [])

  useEffect(() => {
    if (!running) return
    const interval = setInterval(async () => {
      if (!webcamRef.current) return
      const imageSrc = webcamRef.current.getScreenshot()
      if (!imageSrc) return

      if (USE_DEMO_DATA) return // demo mode: feed is static sample data

      try {
        const blob = await (await fetch(imageSrc)).blob()
        const formData = new FormData()
        formData.append('frame', blob, 'frame.jpg')
        const { data } = await attendanceApi.submitFrame(sessionId, formData)
        if (data?.recognitions?.length) {
          setFeed((prev) => [...data.recognitions, ...prev].slice(0, 30))
        }
      } catch {
        // network/recognition errors are surfaced via toast at the page level
      }
    }, 2500)
    return () => clearInterval(interval)
  }, [running, sessionId])

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3">
        <div className="reticle relative rounded-lg overflow-hidden bg-ink aspect-video">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover opacity-90"
            videoConstraints={{ facingMode: 'user' }}
          />
          {running && <div className="scanline top-1/2" />}
          <div className="absolute top-3 left-3">
            <span className={`badge ${running ? 'bg-present/90 text-white' : 'bg-ink/70 text-white'} text-[11px]`}>
              <span className={`w-1.5 h-1.5 rounded-full ${running ? 'bg-white animate-pulseRing' : 'bg-white/50'}`} />
              {running ? 'LIVE RECOGNITION' : 'CAMERA IDLE'}
            </span>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          {!running ? (
            <button className="btn-signal flex-1" onClick={() => setRunning(true)}>
              <Icon name="play" size={16} />
              Start monitoring
            </button>
          ) : (
            <button className="btn-danger flex-1" onClick={() => setRunning(false)}>
              <Icon name="square" size={16} />
              Stop monitoring
            </button>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        <p className="label mb-2">Live recognition feed</p>
        <div className="card divide-y divide-line max-h-[420px] overflow-y-auto">
          {feed.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-ink400">No faces recognized yet</p>
            </div>
          ) : (
            feed.map((entry, i) => (
              <div key={`${entry.id}-${i}`} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink900">{entry.name}</p>
                  <p className="text-xs text-ink400 font-mono">
                    {entry.rollNo} · {entry.time}
                  </p>
                </div>
                <div className="text-right">
                  <span className={statusBadgeClass(entry.status)}>{entry.status.replace('_', ' ')}</span>
                  <p className="text-[11px] font-mono text-ink400 mt-1">{entry.confidence}% conf.</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
