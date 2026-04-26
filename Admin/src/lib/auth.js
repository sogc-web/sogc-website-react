import { ADMIN_API_BASE_URL } from './env'
import { adminRequest, clearAdminCsrfToken, primeAdminCsrfToken } from './adminRequest'

const ADMIN_SESSION_KEY = 'sogc_admin_session'
const SUPERADMIN_EMAIL = 'societyofglobalcycle@gmail.com'

export function getAdminSession() {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(ADMIN_SESSION_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    window.localStorage.removeItem(ADMIN_SESSION_KEY)
    return null
  }
}

export function isAdminAuthenticated() {
  const session = getAdminSession()
  return Boolean(session?.isAuthenticated)
}

export function getAdminRole() {
  const session = getAdminSession()

  if (session?.role) {
    return session.role
  }

  if (session?.email && session.email.trim().toLowerCase() === SUPERADMIN_EMAIL) {
    return 'superadmin'
  }

  return 'admin'
}

export function isSuperAdmin() {
  return getAdminRole() === 'superadmin'
}

export function setAdminSession(session) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
}

export function clearAdminSession() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(ADMIN_SESSION_KEY)
  clearAdminCsrfToken()
}

export async function fetchAdminMe() {
  const payload = await adminRequest('/api/admin/me')
  const session = {
    isAuthenticated: true,
    id: payload.item.id,
    email: payload.item.email,
    name: payload.item.name || 'SOGC Admin',
    role: payload.item.role,
    status: payload.item.status,
  }

  setAdminSession(session)
  primeAdminCsrfToken().catch(() => {})
  return session
}

export function beginGoogleSignIn({ inviteToken = '', redirectTo = '/' } = {}) {
  const query = new URLSearchParams()

  if (inviteToken) {
    query.set('inviteToken', inviteToken)
  }

  if (redirectTo) {
    query.set('redirectTo', redirectTo)
  }

  window.location.href = `${ADMIN_API_BASE_URL}/auth/google?${query.toString()}`
}

export async function logoutAdminSession() {
  try {
    await adminRequest('/auth/logout', {
      method: 'POST',
    })
  } finally {
    clearAdminSession()
  }
}

export async function fetchInviteStatus(token) {
  const payload = await adminRequest(`/api/admin/invites/${encodeURIComponent(token)}`)
  return payload.item
}
