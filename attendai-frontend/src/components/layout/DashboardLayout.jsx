import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function DashboardLayout({ navItems, role, title }) {
  return (
    <div className="min-h-screen flex bg-paper">
      <Sidebar navItems={navItems} role={role} />
      <div className="flex-1 min-w-0">
        <Navbar title={title} navItems={navItems} />
        <main className="px-5 lg:px-8 py-6 max-w-[1400px]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
