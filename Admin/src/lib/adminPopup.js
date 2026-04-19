const ADMIN_API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:8080'

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

export async function fetchAdminPopups() {
  const payload = await request('/api/admin/popups')
  return payload.items ?? []
}

export async function fetchAdminPopup(id) {
  const payload = await request(`/api/admin/popups/${id}`)
  return payload.item
}

export async function createAdminPopup(popup) {
  const payload = await request('/api/admin/popups', {
    method: 'POST',
    body: JSON.stringify(popup),
  })

  return payload.item
}

export async function updateAdminPopup(id, popup) {
  const payload = await request(`/api/admin/popups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(popup),
  })

  return payload.item
}

export async function activateAdminPopup(id) {
  const payload = await request(`/api/admin/popups/${id}/activate`, {
    method: 'PUT',
  })

  return payload.item
}

export async function deleteAdminPopup(id) {
  await request(`/api/admin/popups/${id}`, {
    method: 'DELETE',
  })
}
