import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import AdminLoadingOverlay from '../components/AdminLoadingOverlay'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { fetchAdminMe, getAdminRole, isAdminAuthenticated } from '../lib/auth'
import { subscribeToAdminRequests } from '../lib/adminRequest'

function AdminLayout() {
  const location = useLocation()
  const [authStatus, setAuthStatus] = useState(isAdminAuthenticated() ? 'loading' : 'loading')
  const role = getAdminRole()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeRequests, setActiveRequests] = useState(0)

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

  useEffect(() => subscribeToAdminRequests(setActiveRequests), [])

  if (authStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-8 text-[#dfe8e3]">
        <div className="flex flex-col items-center gap-5 rounded-[32px] border border-[#f8d35c]/20 bg-[#101815]/92 px-8 py-8 text-sm shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="admin-loader admin-loader--compact" aria-hidden="true" />
          <div className="uppercase tracking-[0.14em] text-[#f8d35c]">Checking admin session...</div>
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
      {activeRequests > 0 ? <AdminLoadingOverlay /> : null}
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
