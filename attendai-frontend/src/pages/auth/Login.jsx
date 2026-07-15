import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import Icon from '../../components/common/Icon'
import { ROLES } from '../../utils/constants'

export default function Login() {
  const { login, setUser } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const routeForRole = (role) => {
    if (role === ROLES.ADMIN) return '/admin'
    if (role === ROLES.FACULTY) return '/faculty'
    return '/student'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const user = await login(email, password)
      toast.success(`Welcome back, ${user.name || user.email}`)
      navigate(routeForRole(user.role))
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials — check your backend connection')
    } finally {
      setSubmitting(false)
    }
  }

  // Demo shortcut so reviewers can explore role-based dashboards without a
  // running backend. Remove once the Django API is connected.
  const demoLogin = (role) => {
    setUser({ id: 0, name: `Demo ${role}`, email: `demo.${role}@attendai.edu`, role })
    localStorage.setItem('attendai_access_token', 'demo-token')
    navigate(routeForRole(role))
  }

  return (
    <div className="min-h-screen flex bg-ink relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-faint bg-grid opacity-40 pointer-events-none" />

      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative z-10">
        <div className="flex items-center gap-3">
          <div className="reticle w-10 h-10 rounded bg-signal-500/20 flex items-center justify-center">
            <Icon name="scan-face" size={20} className="text-signal-400" />
          </div>
          <span className="font-display font-semibold text-white text-lg">AttendAI</span>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-signal-400 mb-4">
            Facial recognition · Anti-spoofing · Real-time
          </p>
          <h1 className="font-display text-4xl font-semibold text-white leading-tight max-w-md">
            Attendance, verified the moment a face enters the frame.
          </h1>
          <p className="text-white/50 mt-4 max-w-sm text-sm leading-relaxed">
            AttendAI marks classroom attendance automatically using on-device face
            detection and server-side recognition, rejecting photos, screens and
            proxy attempts before they're logged.
          </p>
        </div>

        <p className="text-white/30 text-xs font-mono">B.TECH AIML CAPSTONE PROJECT · 2026</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="reticle w-9 h-9 rounded bg-signal-500/20 flex items-center justify-center">
              <Icon name="scan-face" size={18} className="text-signal-400" />
            </div>
            <span className="font-display font-semibold text-white text-lg">AttendAI</span>
          </div>

          <div className="bg-card rounded-lg shadow-pop p-7">
            <h2 className="font-display font-semibold text-xl text-ink900">Sign in</h2>
            <p className="text-sm text-ink600 mt-1 mb-6">Access your role-based attendance dashboard</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="input"
                  placeholder="you@institute.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-signal w-full" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-line">
              <p className="text-xs text-ink400 mb-2.5">Preview dashboards without a backend:</p>
              <div className="grid grid-cols-3 gap-2">
                <button className="btn-outline text-xs px-2 py-2" onClick={() => demoLogin(ROLES.ADMIN)}>
                  Admin
                </button>
                <button className="btn-outline text-xs px-2 py-2" onClick={() => demoLogin(ROLES.FACULTY)}>
                  Faculty
                </button>
                <button className="btn-outline text-xs px-2 py-2" onClick={() => demoLogin(ROLES.STUDENT)}>
                  Student
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
