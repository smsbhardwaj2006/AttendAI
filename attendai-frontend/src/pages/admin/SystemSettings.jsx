import { useState } from 'react'
import toast from 'react-hot-toast'
import Icon from '../../components/common/Icon'

export default function SystemSettings() {
  const [threshold, setThreshold] = useState(94)
  const [antiSpoof, setAntiSpoof] = useState(true)
  const [qualityCheck, setQualityCheck] = useState(true)
  const [maxRotation, setMaxRotation] = useState(20)

  const save = () => toast.success('AI recognition settings updated')

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink900">AI recognition settings</h2>
        <p className="text-sm text-ink600 mt-1">Tune thresholds used by the face detection and recognition pipeline</p>
      </div>

      <div className="card p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-ink900">Recognition confidence threshold</label>
            <span className="font-mono text-sm text-signal-600">{threshold}%</span>
          </div>
          <input
            type="range"
            min="70"
            max="99"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-full accent-signal-500"
          />
          <p className="text-xs text-ink400 mt-1">Faces matched below this confidence are sent to manual verification.</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-ink900">Max head rotation tolerance</label>
            <span className="font-mono text-sm text-signal-600">{maxRotation}°</span>
          </div>
          <input
            type="range"
            min="5"
            max="45"
            value={maxRotation}
            onChange={(e) => setMaxRotation(e.target.value)}
            className="w-full accent-signal-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-line">
          <div>
            <p className="text-sm font-medium text-ink900">Anti-spoofing detection</p>
            <p className="text-xs text-ink400">Reject printed photos and screen replay attacks</p>
          </div>
          <button
            onClick={() => setAntiSpoof((v) => !v)}
            className={`w-11 h-6 rounded-full transition-colors relative ${antiSpoof ? 'bg-signal-500' : 'bg-line'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${antiSpoof ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink900">Face quality validation</p>
            <p className="text-xs text-ink400">Reject blurry, poorly lit, or partially visible faces</p>
          </div>
          <button
            onClick={() => setQualityCheck((v) => !v)}
            className={`w-11 h-6 rounded-full transition-colors relative ${qualityCheck ? 'bg-signal-500' : 'bg-line'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${qualityCheck ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      <button className="btn-signal" onClick={save}>
        <Icon name="check" size={16} />
        Save settings
      </button>
    </div>
  )
}
