import { NavLink } from 'react-router-dom'
import Icon from '../common/Icon'

export default function Sidebar({ navItems, role }) {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-ink text-white min-h-screen sticky top-0">
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="reticle w-9 h-9 rounded bg-signal-500/20 flex items-center justify-center">
          <Icon name="scan-face" size={18} className="text-signal-400" />
        </div>
        <div>
          <p className="font-display font-semibold text-white leading-none">AttendAI</p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mt-1">{role}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split('/').length === 2}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon name={item.icon} size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-[10px] font-mono text-white/30 leading-relaxed">
          AI RECOGNITION ENGINE
          <br />
          STATUS: <span className="text-present">ONLINE</span>
        </p>
      </div>
    </aside>
  )
}
