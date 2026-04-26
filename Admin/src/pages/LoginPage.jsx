import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { beginGoogleSignIn, fetchAdminMe, fetchInviteStatus, isAdminAuthenticated } from '../lib/auth'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const redirectPath = location.state?.from?.pathname || '/'
  const inviteToken = searchParams.get('token') || ''
  const errorMessage = searchParams.get('error') || ''
  const [inviteState, setInviteState] = useState({
    loading: Boolean(inviteToken),
    error: '',
    item: null,
  })

  useEffect(() => {
    if (isAdminAuthenticated()) {
      fetchAdminMe()
        .then(() => navigate('/', { replace: true }))
        .catch(() => {})
    }
  }, [navigate])

  useEffect(() => {
    if (!inviteToken) {
      return
    }

    let cancelled = false

    fetchInviteStatus(inviteToken)
      .then((item) => {
        if (!cancelled) {
          setInviteState({ loading: false, error: '', item })
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setInviteState({ loading: false, error: error.message, item: null })
        }
      })

    return () => {
      cancelled = true
    }
  }, [inviteToken])

  const isInviteMode = Boolean(inviteToken)

  function handleGoogleContinue() {
    beginGoogleSignIn({
      inviteToken,
      redirectTo: redirectPath,
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#101815]/90 p-8 shadow-2xl shadow-black/20">
        <p className="text-xs uppercase tracking-[0.35em] text-[#f8d35c]">SOGC Admin</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">
          {isInviteMode ? 'Accept admin invite' : 'Sign in to admin panel'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#9db0a7]">
          {isInviteMode
            ? 'Continue with Google using the exact invited email address. That account will be activated after a successful match.'
            : 'Admin access is invite-only and Google OAuth only. No password login or public signup is allowed.'}
        </p>

        <div className="mt-8 space-y-4">
          {errorMessage ? (
            <div className="rounded-2xl border border-[#ffb4a2]/20 bg-[#ffb4a2]/10 px-4 py-3 text-sm text-[#ffd7cd]">
              {errorMessage}
            </div>
          ) : null}

          {isInviteMode ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-[#dfe8e3]">
              {inviteState.loading ? (
                <p>Checking your invite…</p>
              ) : inviteState.error ? (
                <p className="text-[#ffd7cd]">{inviteState.error}</p>
              ) : inviteState.item ? (
                <div className="space-y-2">
                  <p>
                    <span className="text-[#9db0a7]">Invited email:</span> {inviteState.item.email}
                  </p>
                  <p>
                    <span className="text-[#9db0a7]">Role:</span> {inviteState.item.role}
                  </p>
                  <p>
                    <span className="text-[#9db0a7]">Invite valid until:</span>{' '}
                    {new Date(inviteState.item.inviteTokenExpiresAt).toLocaleString()}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleGoogleContinue}
            disabled={inviteState.loading || Boolean(inviteState.error)}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 font-medium text-[#182119] transition hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M12 10.2v3.9h5.4c-.24 1.26-.96 2.32-2.04 3.03l3.3 2.56c1.92-1.77 3.03-4.38 3.03-7.48 0-.71-.06-1.39-.19-2.01H12Z"
              />
              <path
                fill="#34A853"
                d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.3-2.56c-.91.61-2.08.97-3.33.97-2.56 0-4.73-1.73-5.5-4.06H3.09v2.64A10 10 0 0 0 12 22Z"
              />
              <path
                fill="#4A90E2"
                d="M6.5 13.92A6 6 0 0 1 6.2 12c0-.67.11-1.32.3-1.92V7.44H3.09A10 10 0 0 0 2 12c0 1.61.38 3.14 1.09 4.56l3.41-2.64Z"
              />
              <path
                fill="#FBBC05"
                d="M12 5.98c1.47 0 2.78.5 3.82 1.47l2.87-2.87C16.96 2.98 14.7 2 12 2A10 10 0 0 0 3.09 7.44l3.41 2.64c.77-2.33 2.94-4.1 5.5-4.1Z"
              />
            </svg>
            Continue with Google
          </button>

          {isInviteMode ? (
            <Link to="/login" className="block text-center text-sm text-[#9db0a7] transition hover:text-white">
              Back to standard admin sign-in
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default LoginPage
