import { NavLink, useNavigate } from 'react-router-dom'
import { clearAdminSession, getAdminRole, getAdminSession } from '../lib/auth'
import { navigationItems } from '../lib/navigation'

function Icon({ name, className = 'h-5 w-5' }) {
  const commonProps = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  }

  switch (name) {
    case 'dashboard':
      return (
        <svg {...commonProps}>
          <path d="M4 5h7v6H4zM13 5h7v10h-7zM4 13h7v6H4zM13 17h7v2h-7z" />
        </svg>
      )
    case 'admins':
      return (
        <svg {...commonProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9.5" cy="7" r="3" />
          <path d="M17 11a3 3 0 1 0 0-6" />
          <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
        </svg>
      )
    case 'events':
      return (
        <svg {...commonProps}>
          <path d="M8 2v4M16 2v4M3 10h18" />
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M8 14h3M8 18h8M16 14h.01" />
        </svg>
      )
    case 'gallery':
      return (
        <svg {...commonProps}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m8 11 2.5 2.5 2-2 4.5 4.5" />
          <circle cx="16" cy="9" r="1.5" />
        </svg>
      )
    case 'popup':
      return (
        <svg {...commonProps}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 9h8M8 13h5" />
        </svg>
      )
    case 'menu':
      return (
        <svg {...commonProps}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      )
    case 'close':
      return (
        <svg {...commonProps}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      )
    default:
      return null
  }
}

function Sidebar({ collapsed = false, mobileOpen = false, onClose, onToggleCollapse }) {
  const navigate = useNavigate()
  const session = getAdminSession()
  const role = getAdminRole()
  const desktopCollapsed = collapsed
  const visibleNavigationItems = navigationItems.filter(
    (item) => !item.requiresRole || item.requiresRole === role,
  )

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition md:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-4 left-4 z-40 flex w-[min(84vw,320px)] flex-col rounded-[28px] border border-white/10 bg-[#101815]/95 p-4 shadow-2xl shadow-black/30 transition duration-300 md:sticky md:top-6 md:z-10 md:h-[calc(100vh-3rem)] md:w-full md:translate-x-0 ${
          desktopCollapsed ? 'md:max-w-[88px]' : 'md:max-w-[280px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-[120%] md:translate-x-0'}`}
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden h-11 w-11 items-center justify-center self-start rounded-2xl border border-white/10 bg-white/5 text-white md:inline-flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon name="menu" />
        </button>

        <div className="mb-4 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-3">
            <img
              src="/sogc-logo.png"
              alt="SOGC admin logo"
              className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 object-contain p-1.5"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">SOGC Admin</p>
              <h1 className="mt-2 text-lg font-semibold text-white">Content control panel</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white"
            aria-label="Close sidebar"
          >
            <Icon name="close" />
          </button>
        </div>

        <nav className={`space-y-2 ${desktopCollapsed ? 'md:mt-4' : 'md:mt-2'}`}>
          {visibleNavigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition ${
                  desktopCollapsed ? 'md:justify-center md:px-0' : ''
                } ${
                  isActive
                    ? 'border-[#f8d35c]/40 bg-[#f8d35c]/10 text-white'
                    : 'border-transparent bg-white/0 text-[#b9c8c1] hover:border-white/10 hover:bg-white/5 hover:text-white'
                }`
              }
              title={desktopCollapsed ? item.label : undefined}
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/15 text-[#f8d35c]">
                <Icon name={item.icon} className="h-4.5 w-4.5" />
              </span>
              <span className={desktopCollapsed ? 'md:hidden' : ''}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6">
          {!desktopCollapsed ? (
            <div className="border-t border-white/10 pt-4">
              {session?.email ? <p className="truncate text-sm text-[#94a59c]">{session.email}</p> : null}
            </div>
          ) : null}

          <div className={`${desktopCollapsed ? 'md:border-t md:border-white/10 md:pt-4' : 'mt-4 border-t border-white/10 pt-4'}`}>
            <button
              type="button"
              onClick={() => {
                clearAdminSession()
                onClose?.()
                navigate('/login', { replace: true })
              }}
              className={`w-full rounded-2xl bg-[#f8d35c] px-4 py-3 text-sm font-medium text-[#1b1b12] transition hover:bg-[#ffbf2f] ${
                desktopCollapsed ? 'md:flex md:items-center md:justify-center md:px-0' : ''
              }`}
              aria-label="Sign out"
              title={desktopCollapsed ? 'Sign out' : undefined}
            >
              {desktopCollapsed ? (
                <svg
                  className="hidden h-5 w-5 md:block"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="m16 17 5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>
              ) : (
                'Sign out'
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
