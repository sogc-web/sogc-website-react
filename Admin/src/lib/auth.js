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
}
