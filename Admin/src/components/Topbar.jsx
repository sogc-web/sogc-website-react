import { getAdminSession } from '../lib/auth'

function MenuIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function Topbar({ onToggleSidebar }) {
  const session = getAdminSession()

  return (
    <header className="rounded-[18px] border border-white/10 bg-[#101815]/65 px-3 py-2.5 backdrop-blur md:rounded-[24px] md:px-6 md:py-4">
      <div className="flex min-h-[40px] items-center justify-between gap-3 md:min-h-0">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white md:hidden"
            aria-label="Open sidebar"
          >
            <MenuIcon />
          </button>
          <img
            src="/sogc-logo.png"
            alt="SOGC admin logo"
            className="h-9 w-9 shrink-0 rounded-xl border border-white/10 bg-white/5 object-contain p-1.5 md:h-11 md:w-11 md:rounded-2xl"
          />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-white md:text-xl">SOGC Admin</h2>
            <p className="hidden text-[11px] uppercase tracking-[0.24em] text-[#f8d35c] md:block">Admin workspace</p>
          </div>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          {session?.email ? (
            <p className="max-w-[320px] truncate text-sm text-[#9db0a7]">{session.email}</p>
          ) : null}
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#b9c8c1]">
            Admin routes protected
          </div>
        </div>
      </div>
    </header>
  )
}

export default Topbar
