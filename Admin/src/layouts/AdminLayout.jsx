import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { fetchAdminMe, getAdminRole, isAdminAuthenticated } from '../lib/auth'

function AdminLayout() {
  const location = useLocation()
  const [authStatus, setAuthStatus] = useState(isAdminAuthenticated() ? 'loading' : 'loading')
  const role = getAdminRole()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetchAdminMe()
      .then(() => {
        if (!cancelled) {
          setAuthStatus('authenticated')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAuthStatus('unauthenticated')
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (authStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-8 text-[#dfe8e3]">
        <div className="rounded-[28px] border border-white/10 bg-[#101815]/85 px-8 py-6 text-sm">
          Checking admin session…
        </div>
      </div>
    )
  }

  if (authStatus !== 'authenticated') {
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
