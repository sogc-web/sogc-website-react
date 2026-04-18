import { useLocation, useNavigate } from 'react-router-dom'
import { setAdminSession } from '../lib/auth'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectPath = location.state?.from?.pathname || '/'

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#101815]/90 p-8 shadow-2xl shadow-black/20">
        <p className="text-xs uppercase tracking-[0.35em] text-[#f8d35c]">SOGC Admin</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Sign in with Google</h1>
        <p className="mt-3 text-sm leading-6 text-[#9db0a7]">
          This screen is ready for backend Google OAuth wiring. Access should be allowed only for whitelisted admin
          emails.
        </p>

        <button
          type="button"
          onClick={() => {
            setAdminSession({
              isAuthenticated: true,
              email: 'admin@sogc.local',
              name: 'Admin User',
            })
            navigate(redirectPath, { replace: true })
          }}
          className="mt-8 flex w-full items-center justify-center rounded-2xl bg-white px-5 py-4 font-medium text-[#182119] transition hover:bg-[#f5f5f5]"
        >
          Continue with Google
        </button>

        <div className="mt-8 rounded-2xl border border-[#f8d35c]/20 bg-[#f8d35c]/8 p-4 text-sm leading-6 text-[#dfe8e3]">
          Version 1 rule: no email/password login, no signup page, no forgot password flow.
        </div>
      </div>
    </div>
  )
}

export default LoginPage
