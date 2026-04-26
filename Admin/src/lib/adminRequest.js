import { ADMIN_API_BASE_URL } from './env'

export async function adminRequest(path, options = {}) {
  const response = await fetch(`${ADMIN_API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (response.status === 204) {
    return null
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('sogc_admin_session')
      }
    }

    const message = payload?.error || payload?.message || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return payload
}
