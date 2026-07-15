import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Icon from '../common/Icon'
import { initials } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function Navbar({ title, navItems }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-card/90 backdrop-blur border-b border-line">
      <div className="flex items-center justify-between px-5 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden text-ink600"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            <Icon name="grid" size={20} />
          </button>
          <h1 className="font-display font-semibold text-lg text-ink900">{title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative text-ink600 hover:text-ink900" aria-label="Notifications">
            <Icon name="bell" size={19} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-absent" />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded hover:bg-paper transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-signal-500 text-white flex items-center justify-center text-xs font-semibold">
                {initials(user?.name || user?.email || 'U')}
              </div>
              <Icon name="chevronDown" size={14} className="text-ink400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 card py-1 shadow-pop">
                <div className="px-3 py-2 border-b border-line">
                  <p className="text-sm font-medium text-ink900 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-ink400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-absent hover:bg-paper transition-colors"
                >
                  <Icon name="logout" size={15} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileNavOpen && (
        <nav className="lg:hidden border-t border-line px-3 py-2 space-y-1 bg-ink">
          {navItems.map((item) => (
            <a key={item.to} href={item.to} className="sidebar-link">
              <Icon name={item.icon} size={16} />
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
