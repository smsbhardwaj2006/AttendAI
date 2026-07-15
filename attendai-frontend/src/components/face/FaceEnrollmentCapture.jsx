import { useCallback, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import Icon from '../common/Icon'
import toast from 'react-hot-toast'

const REQUIRED_SAMPLES = 5
const POSE_PROMPTS = ['Look straight ahead', 'Turn slightly left', 'Turn slightly right', 'Tilt chin up', 'Tilt chin down']

/**
 * Captures multiple face samples for enrollment, per the Face Enrollment
 * AI module (quality validation happens server-side once uploaded).
 */
export default function FaceEnrollmentCapture({ onComplete }) {
  const webcamRef = useRef(null)
  const [samples, setSamples] = useState([])
  const [capturing, setCapturing] = useState(false)

  const capture = useCallback(() => {
    if (!webcamRef.current) return
    const imageSrc = webcamRef.current.getScreenshot()
    if (!imageSrc) {
      toast.error('Could not access camera frame — check permissions')
      return
    }
    setSamples((prev) => {
      const next = [...prev, imageSrc]
      if (next.length >= REQUIRED_SAMPLES) {
        setCapturing(false)
        onComplete?.(next)
      }
      return next
    })
  }, [onComplete])

  const reset = () => setSamples([])

  const progress = Math.min(samples.length, REQUIRED_SAMPLES)
  const promptIndex = Math.min(progress, POSE_PROMPTS.length - 1)

  return (
    <div className="card p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="reticle relative rounded-lg overflow-hidden bg-ink aspect-video">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover opacity-90"
              videoConstraints={{ facingMode: 'user' }}
            />
            {capturing && <div className="scanline top-1/2" />}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className="badge bg-ink/70 text-white font-mono text-[11px]">
                {progress}/{REQUIRED_SAMPLES} SAMPLES
              </span>
              {progress < REQUIRED_SAMPLES && (
                <span className="badge bg-signal-500/90 text-white text-[11px]">{POSE_PROMPTS[promptIndex]}</span>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              className="btn-signal flex-1"
              disabled={progress >= REQUIRED_SAMPLES}
              onClick={() => {
                setCapturing(true)
                capture()
              }}
            >
              <Icon name="camera" size={16} />
              Capture sample
            </button>
            <button className="btn-outline" onClick={reset} disabled={samples.length === 0}>
              Reset
            </button>
          </div>
        </div>

        <div className="w-full lg:w-48 shrink-0">
          <p className="label">Captured samples</p>
          <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
            {Array.from({ length: REQUIRED_SAMPLES }).map((_, i) => (
              <div
                key={i}
                className="reticle aspect-square rounded overflow-hidden bg-paper border border-line flex items-center justify-center"
              >
                {samples[i] ? (
                  <img src={samples[i]} alt={`Sample ${i + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <Icon name="scan-face" size={16} className="text-ink400" />
                )}
              </div>
            ))}
          </div>
          {progress >= REQUIRED_SAMPLES && (
            <p className="mt-3 text-xs text-present flex items-center gap-1.5">
              <Icon name="check" size={14} /> Ready to submit for enrollment
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
