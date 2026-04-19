import { ADMIN_API_BASE_URL } from './env'

async function request(path, options = {}) {
  const response = await fetch(`${ADMIN_API_BASE_URL}${path}`, {
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
    const message = payload?.message || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return payload
}

export async function fetchAdminEvents() {
  const payload = await request('/api/admin/events')
  return payload.items ?? []
}

export async function fetchAdminEvent(id) {
  const payload = await request(`/api/admin/events/${id}`)
  return payload.item
}

export async function createAdminEvent(event) {
  const payload = await request('/api/admin/events', {
    method: 'POST',
    body: JSON.stringify(event),
  })

  return payload.item
}

export async function updateAdminEvent(id, event) {
  const payload = await request(`/api/admin/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(event),
  })

  return payload.item
}

export async function deleteAdminEvent(id) {
  await request(`/api/admin/events/${id}`, {
    method: 'DELETE',
  })
}
