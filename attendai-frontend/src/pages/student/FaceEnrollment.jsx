import { useState } from 'react'
import toast from 'react-hot-toast'
import FaceEnrollmentCapture from '../../components/face/FaceEnrollmentCapture'
import Icon from '../../components/common/Icon'

export default function FaceEnrollment() {
  const [enrolled, setEnrolled] = useState(false)
  const [samples, setSamples] = useState([])

  const handleComplete = (captured) => {
    setSamples(captured)
    toast.success('All samples captured — ready to submit')
  }

  const submit = async () => {
    // POST samples to studentsApi.enrollFace(id, formData) in a real backend
    setEnrolled(true)
    toast.success('Face enrollment submitted for processing')
  }

  if (enrolled) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="reticle w-16 h-16 rounded-full bg-present/10 text-present flex items-center justify-center mx-auto mb-4">
          <Icon name="check" size={26} />
        </div>
        <h2 className="font-display text-xl font-semibold text-ink900">Enrollment submitted</h2>
        <p className="text-sm text-ink600 mt-2">
          Your facial data is being processed and validated. This usually takes a few minutes — you'll get a notification once it's ready.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink900">Face enrollment</h2>
        <p className="text-sm text-ink600 mt-1">
          Capture 5 samples in good lighting, facing the camera directly, to enroll your face for attendance recognition.
        </p>
      </div>

      <FaceEnrollmentCapture onComplete={handleComplete} />

      <button className="btn-signal" disabled={samples.length < 5} onClick={submit}>
        <Icon name="scan-face" size={16} />
        Submit for enrollment
      </button>
    </div>
  )
}
