import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { getAdminRole, isAdminAuthenticated } from '../lib/auth'

function AdminLayout() {
  const location = useLocation()
  const isAuthenticated = isAdminAuthenticated()
  const role = getAdminRole()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (location.pathname.startsWith('/admins') && role !== 'superadmin') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-transparent px-3 py-3 md:px-6 md:py-6">
      <div className="mx-auto flex max-w-[1440px] gap-4 md:gap-6">
        <Sidebar
          collapsed={sidebarCollapsed}
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
        />
        <main className="min-w-0 flex-1 space-y-4 md:space-y-6">
          <Topbar onToggleSidebar={() => setSidebarOpen((current) => !current)} />
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
