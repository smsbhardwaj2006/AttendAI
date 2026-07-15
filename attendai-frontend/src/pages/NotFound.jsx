import { Link } from 'react-router-dom'
import Icon from '../components/common/Icon'

export default function NotFound({ code = '404', message = "Page not found — the route you're looking for doesn't exist." }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper px-6 text-center">
      <div className="reticle w-16 h-16 rounded-full bg-signal-50 text-signal-600 flex items-center justify-center mb-5">
        <Icon name="alertTriangle" size={26} />
      </div>
      <h1 className="font-display text-3xl font-semibold text-ink900">{code}</h1>
      <p className="text-sm text-ink600 mt-2 max-w-sm">{message}</p>
      <Link to="/login" className="btn-signal mt-6">
        Back to sign in
      </Link>
    </div>
  )
}
