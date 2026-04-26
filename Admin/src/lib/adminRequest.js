import { ADMIN_API_BASE_URL } from './env'

let csrfToken = ''
let csrfTokenPromise = null
let activeRequestCount = 0
const requestListeners = new Set()

function isWriteMethod(method) {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(String(method || 'GET').toUpperCase())
}

function emitRequestState() {
  for (const listener of requestListeners) {
    listener(activeRequestCount)
  }
}

function beginTrackedRequest() {
  activeRequestCount += 1
  emitRequestState()
}

function endTrackedRequest() {
  activeRequestCount = Math.max(0, activeRequestCount - 1)
  emitRequestState()
}

export function subscribeToAdminRequests(listener) {
  requestListeners.add(listener)
  listener(activeRequestCount)

  return () => {
    requestListeners.delete(listener)
  }
}

async function fetchAdminCsrfToken() {
  const response = await fetch(`${ADMIN_API_BASE_URL}/api/admin/csrf`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = payload?.error || payload?.message || 'Unable to fetch CSRF token.'
    throw new Error(message)
  }

  return payload?.item?.token || ''
}

export async function primeAdminCsrfToken({ forceRefresh = false } = {}) {
  if (!forceRefresh && csrfToken) {
    return csrfToken
  }

  if (!csrfTokenPromise || forceRefresh) {
    csrfTokenPromise = fetchAdminCsrfToken()
      .then((token) => {
        csrfToken = token
        return token
      })
      .finally(() => {
        csrfTokenPromise = null
      })
  }

  return csrfTokenPromise
}

export function clearAdminCsrfToken() {
  csrfToken = ''
  csrfTokenPromise = null
}

export async function adminRequest(path, options = {}) {
  beginTrackedRequest()

  try {
    const method = String(options.method || 'GET').toUpperCase()
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    }

    if (isWriteMethod(method) && !headers['X-CSRF-Token']) {
      headers['X-CSRF-Token'] = await primeAdminCsrfToken()
    }

    let response = await fetch(`${ADMIN_API_BASE_URL}${path}`, {
      credentials: 'include',
      headers,
      ...options,
      method,
    })

    if (response.status === 204) {
      return null
    }

    let payload = await response.json().catch(() => null)

    if (response.status === 403 && payload?.error === 'CSRF token is missing or invalid.' && isWriteMethod(method)) {
      headers['X-CSRF-Token'] = await primeAdminCsrfToken({ forceRefresh: true })
      response = await fetch(`${ADMIN_API_BASE_URL}${path}`, {
        credentials: 'include',
        headers,
        ...options,
        method,
      })

      if (response.status === 204) {
        return null
      }

      payload = await response.json().catch(() => null)
    }

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('sogc_admin_session')
        }
        clearAdminCsrfToken()
      }

      const message = payload?.error || payload?.message || `Request failed with status ${response.status}`
      throw new Error(message)
    }

    return payload
  } finally {
    endTrackedRequest()
  }
}
