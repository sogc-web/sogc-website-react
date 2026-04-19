import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { setAdminSession } from '../lib/auth'
import { ADMIN_LOGIN_EMAIL, ADMIN_LOGIN_PASSWORD } from '../lib/env'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectPath = location.state?.from?.pathname || '/'
  const [form, setForm] = useState({ email: '', password: '' })
  const [errorMessage, setErrorMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const email = form.email.trim()
    const password = form.password

    if (email !== ADMIN_LOGIN_EMAIL || password !== ADMIN_LOGIN_PASSWORD) {
      setErrorMessage('Invalid admin email or password.')
      return
    }

    setAdminSession({
      isAuthenticated: true,
      email,
      name: 'SOGC Admin',
    })
    navigate(redirectPath, { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#101815]/90 p-8 shadow-2xl shadow-black/20">
        <p className="text-xs uppercase tracking-[0.35em] text-[#f8d35c]">SOGC Admin</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Sign in to admin panel</h1>
        <p className="mt-3 text-sm leading-6 text-[#9db0a7]">
          Use the temporary admin credentials configured for this environment. Replace this with Google OAuth before
          production-grade access control.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm text-[#dfe8e3]">Admin email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => {
                setForm((current) => ({ ...current, email: event.target.value }))
                setErrorMessage('')
              }}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition focus:border-[#f8d35c]/50"
              placeholder="name@example.com"
              autoComplete="username"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-[#dfe8e3]">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => {
                setForm((current) => ({ ...current, password: event.target.value }))
                setErrorMessage('')
              }}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition focus:border-[#f8d35c]/50"
              placeholder="Enter admin password"
              autoComplete="current-password"
              required
            />
          </label>

          {errorMessage ? (
            <div className="rounded-2xl border border-[#ffb4a2]/20 bg-[#ffb4a2]/10 px-4 py-3 text-sm text-[#ffd7cd]">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-2xl bg-white px-5 py-4 font-medium text-[#182119] transition hover:bg-[#f5f5f5]"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
